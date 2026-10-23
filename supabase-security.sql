-- =====================================================================================
-- Segurança do banco (RLS + permissões). Substitui fix-attendance-rls.sql e
-- supabase-admin-policy-check.sql.
--
-- Como usar: Supabase > SQL Editor > New query > cole tudo > Run.
-- Pode ser executado mais de uma vez. Roda dentro de uma transação: se qualquer passo
-- falhar, nada é alterado.
--
-- Regras:
--   * Sem login, ninguém lê nem grava nada (o app só acessa o banco depois de entrar).
--   * Membros veem eventos, presenças, chat e nome/foto dos outros membros.
--     E-mails ficam visíveis só para o próprio dono (o app usa o e-mail do Auth).
--   * Cada membro só altera o PRÓPRIO nome e foto. `role` nunca pode ser alterado pelo app:
--     para tornar alguém admin, use o Table Editor do Supabase.
--   * Só admins criam, editam e excluem eventos.
--   * Presença e mensagens só podem ser gravadas em nome de quem está logado.
--     O nome exibido no chat vem do perfil (não dá para se passar por outra pessoa).
--   * O autor ou um admin pode apagar uma mensagem até 60 horas depois do envio
--     (mesmo prazo do "apagar para todos" do WhatsApp). Depois disso, ninguém apaga pelo app.
-- =====================================================================================

begin;

-- -------------------------------------------------------------------------------------
-- 0. Coluna antiga de senha (do login antigo, antes do Supabase Auth).
--    As senhas de verdade ficam no Supabase Auth, criptografadas. Esta coluna não é mais
--    usada pelo app e estava legível por qualquer pessoa.
-- -------------------------------------------------------------------------------------
alter table public."user" drop column if exists password;

-- -------------------------------------------------------------------------------------
-- 1. Funções auxiliares (security definer: consultam a tabela user sem esbarrar no RLS)
-- -------------------------------------------------------------------------------------
create or replace function public.current_profile_id()
returns bigint
language sql stable security definer
set search_path = ''
as $$
  select id from public."user" where auth_user_id = auth.uid() limit 1
$$;

create or replace function public.is_admin()
returns boolean
language sql stable security definer
set search_path = ''
as $$
  select exists (select 1 from public."user" where auth_user_id = auth.uid() and role = 'admin')
$$;

revoke all on function public.current_profile_id() from public, anon;
revoke all on function public.is_admin() from public, anon;
grant execute on function public.current_profile_id() to authenticated;
grant execute on function public.is_admin() to authenticated;

-- Usada pelo workflow "Supabase Keep Alive" do GitHub (não lê nenhuma tabela).
create or replace function public.keep_alive()
returns integer
language sql stable
set search_path = ''
as $$ select 1 $$;

revoke all on function public.keep_alive() from public;
grant execute on function public.keep_alive() to anon, authenticated;

-- -------------------------------------------------------------------------------------
-- 2. Permissões de tabela. O padrão do Supabase dá TUDO para anon e authenticated;
--    deixamos só o necessário. Na tabela user, as permissões são por coluna.
-- -------------------------------------------------------------------------------------
revoke all on public."user", public.meeting, public.attendance, public.messages from anon, authenticated;

grant select (id, name, role, avatar_url, auth_user_id, created_at) on public."user" to authenticated;
grant insert (name, email, auth_user_id) on public."user" to authenticated;
grant update (name, avatar_url) on public."user" to authenticated;

grant select, insert, update, delete on public.meeting to authenticated;
grant select, insert, delete on public.attendance to authenticated;
grant select, insert, delete on public.messages to authenticated;

alter table public."user" enable row level security;
alter table public.meeting enable row level security;
alter table public.attendance enable row level security;
alter table public.messages enable row level security;

-- -------------------------------------------------------------------------------------
-- 3. Tabela user (perfis)
-- -------------------------------------------------------------------------------------
drop policy if exists "Enable insert for authenticated users only" on public."user";
drop policy if exists "Enable read access for all users" on public."user";
drop policy if exists "Users can insert their own profile" on public."user";
drop policy if exists "update policy" on public."user";
drop policy if exists "user_select_members" on public."user";
drop policy if exists "user_insert_own" on public."user";
drop policy if exists "user_update_own" on public."user";

create policy "user_select_members" on public."user"
  for select to authenticated using (true);

create policy "user_insert_own" on public."user"
  for insert to authenticated with check (auth_user_id = auth.uid());

create policy "user_update_own" on public."user"
  for update to authenticated
  using (auth_user_id = auth.uid())
  with check (auth_user_id = auth.uid());

-- Foto: só imagem embutida (data URL raster em base64), até ~300 KB. NOT VALID = não
-- confere as fotos antigas, só as novas gravações.
alter table public."user" drop constraint if exists user_avatar_url_safe;
alter table public."user" add constraint user_avatar_url_safe check (
  avatar_url is null
  or (length(avatar_url) <= 300000 and avatar_url ~ '^data:image/(jpeg|png|webp|gif);base64,[A-Za-z0-9+/]+={0,2}$')
) not valid;

alter table public."user" drop constraint if exists user_name_length;
alter table public."user" add constraint user_name_length check (char_length(trim(name)) between 1 and 80) not valid;

-- Um perfil por conta. Se já houver perfis duplicados, só avisa (não apaga nada).
do $$
begin
  if exists (
    select 1 from public."user" where auth_user_id is not null group by auth_user_id having count(*) > 1
  ) then
    raise notice 'Há perfis duplicados para a mesma conta; o índice único de auth_user_id não foi criado.';
  else
    create unique index if not exists user_auth_user_id_key on public."user" (auth_user_id);
  end if;
end $$;

-- -------------------------------------------------------------------------------------
-- 4. Tabela meeting (eventos)
-- -------------------------------------------------------------------------------------
drop policy if exists "Enable read access for all users" on public.meeting;
drop policy if exists "Enable insert for authenticated users only" on public.meeting;
drop policy if exists "Admin users can insert meetings" on public.meeting;
drop policy if exists "Admin users can update meetings" on public.meeting;
drop policy if exists "Admin users can delete meetings" on public.meeting;
drop policy if exists "meeting_select_members" on public.meeting;
drop policy if exists "meeting_admin_insert" on public.meeting;
drop policy if exists "meeting_admin_update" on public.meeting;
drop policy if exists "meeting_admin_delete" on public.meeting;

create policy "meeting_select_members" on public.meeting
  for select to authenticated using (true);
create policy "meeting_admin_insert" on public.meeting
  for insert to authenticated with check (public.is_admin());
create policy "meeting_admin_update" on public.meeting
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "meeting_admin_delete" on public.meeting
  for delete to authenticated using (public.is_admin());

-- Link de transmissão: só http(s). NOT VALID = não confere eventos antigos.
alter table public.meeting drop constraint if exists meeting_link_http;
alter table public.meeting add constraint meeting_link_http check (
  meeting_link is null or meeting_link ~* '^https?://'
) not valid;

-- -------------------------------------------------------------------------------------
-- 5. Tabela attendance (presenças)
-- -------------------------------------------------------------------------------------
drop policy if exists "Enable read access for all users" on public.attendance;
drop policy if exists "Enable insert for users" on public.attendance;
drop policy if exists "Enable delete for users" on public.attendance;
drop policy if exists "Enable insert for authenticated users only" on public.attendance;
drop policy if exists "Enable delete for authenticated users only" on public.attendance;
drop policy if exists "attendance_select_members" on public.attendance;
drop policy if exists "attendance_insert_own" on public.attendance;
drop policy if exists "attendance_delete_own" on public.attendance;

create policy "attendance_select_members" on public.attendance
  for select to authenticated using (true);
create policy "attendance_insert_own" on public.attendance
  for insert to authenticated with check (user_id = public.current_profile_id());
create policy "attendance_delete_own" on public.attendance
  for delete to authenticated using (user_id = public.current_profile_id() or public.is_admin());

-- Uma presença por pessoa por evento (remove duplicatas antes, que não têm utilidade).
delete from public.attendance a
  using public.attendance b
  where a.user_id = b.user_id and a.meeting_id = b.meeting_id and a.id > b.id;
create unique index if not exists attendance_user_meeting_key on public.attendance (user_id, meeting_id);

-- -------------------------------------------------------------------------------------
-- 6. Tabela messages (chat)
-- -------------------------------------------------------------------------------------
drop policy if exists "Mensagens visíveis para todos" on public.messages;
drop policy if exists "Qualquer um pode inserir mensagem" on public.messages;
drop policy if exists "messages_select_members" on public.messages;
drop policy if exists "messages_insert_own" on public.messages;
drop policy if exists "messages_delete_own_or_admin" on public.messages;

create policy "messages_select_members" on public.messages
  for select to authenticated using (true);
create policy "messages_insert_own" on public.messages
  for insert to authenticated with check (user_id = public.current_profile_id());
create policy "messages_delete_own_or_admin" on public.messages
  for delete to authenticated using (
    (user_id = public.current_profile_id() or public.is_admin())
    and created_at > now() - interval '60 hours'
  );

-- O nome exibido vem sempre do perfil e a data é sempre a do servidor
-- (uma data falsa no futuro travaria a atualização do chat para todo mundo).
create or replace function public.messages_before_insert()
returns trigger
language plpgsql security definer
set search_path = ''
as $$
begin
  select u.name into new.user_name from public."user" u where u.id = new.user_id;
  new.user_avatar := null;
  new.created_at := now();
  return new;
end
$$;

revoke all on function public.messages_before_insert() from public, anon, authenticated;

drop trigger if exists messages_before_insert on public.messages;
create trigger messages_before_insert
  before insert on public.messages
  for each row execute function public.messages_before_insert();

alter table public.messages drop constraint if exists messages_text_length;
alter table public.messages add constraint messages_text_length check (text is null or char_length(text) <= 500) not valid;

commit;
