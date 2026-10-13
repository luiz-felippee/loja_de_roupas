# Decisões

## D1 — Cloudflare para site, API e banco
- **Contexto:** o cliente pediu tudo gratuito, sem Vercel (plano Hobby não cobre uso comercial).
- **Decisão:** Cloudflare Pages (site), Workers (API) e D1 (banco). Todos com plano gratuito suficiente para uma loja local.
- **Descartado:** Vercel + Supabase (custo ao crescer e Hobby não permitido para uso comercial).

## D2 — Valores calculados só no servidor
- **Contexto:** o site enviava preço e total no pedido, o que permitiria adulteração.
- **Decisão:** o pedido envia só itens (produto, cor, tamanho, quantidade), cupom e forma de pagamento. Preço, promoção, cupom e frete são recalculados no Worker.

## D3 — Login da equipe próprio, sem Cloudflare Access
- **Contexto:** a equipe são 3 pessoas; Access exigiria cadastrar cada e-mail.
- **Decisão:** senha única da equipe, guardada como hash PBKDF2; sessão em cookie.
- **Consequência:** uma senha compartilhada. Trocar exige rodar o script de hash e atualizar o banco. Revisar se a equipe crescer.

## D4 — Caixa e favoritos continuam locais
- **Contexto:** o caixa é operado no aparelho da loja e não precisa ser sincronizado com o cliente.
- **Decisão:** manter em `localStorage` nesta versão. Migrar para o D1 quando houver mais de um caixa.

## D5 — Estoque baixado em lote atômico
- **Decisão:** o pedido e a baixa de estoque são um lote no D1. Uma `CHECK (stock >= 0)` faz o lote inteiro falhar se o estoque acabar no meio da compra.
- **Limitação:** a validação de cupom ainda é leitura seguida de escrita; em alto volume, o limite de usos pode ser excedido por uma unidade.

## D6 — Produtos desativados, nunca apagados
- **Decisão:** excluir produto seta `active = 0`, preservando pedidos antigos.

## D7 — Vídeo do topo como mídia estática
- **Contexto:** o topo usa um vídeo de surfista em `public/media/`.
- **Decisão:** vídeo curto, mudo, em loop, com poster e fallback em gradiente. Não entra cena 3D (removida).
