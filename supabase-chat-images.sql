-- Imagens no chat dos eventos.
-- Execute UMA vez no Supabase: Dashboard > SQL Editor > New query > cole e clique em "Run".
--
-- A imagem é higienizada no app (assinatura do arquivo conferida + redesenhada em canvas como JPEG),
-- e o banco reforça a regra: só aceita data URL JPEG em base64 com tamanho limitado.
-- Assim, mesmo alguém chamando a API diretamente não consegue gravar outro tipo de conteúdo.

alter table public.messages
  add column if not exists image_url text;

-- Permite mensagem só com foto (texto vazio).
alter table public.messages
  alter column text drop not null;

alter table public.messages
  drop constraint if exists messages_image_url_safe;

alter table public.messages
  add constraint messages_image_url_safe check (
    image_url is null
    or (
      length(image_url) <= 800000
      and image_url ~ '^data:image/jpeg;base64,[A-Za-z0-9+/]+={0,2}$'
    )
  );

-- Toda mensagem precisa ter texto ou imagem.
alter table public.messages
  drop constraint if exists messages_text_or_image;

alter table public.messages
  add constraint messages_text_or_image check (
    coalesce(length(trim(text)), 0) > 0 or image_url is not null
  );
