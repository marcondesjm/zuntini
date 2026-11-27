# Zuntini & Albertini — Advogadas Associadas

Site institucional desenvolvido a partir da prévia e da identidade visual fornecidas pelo escritório.

- **Site:** [zuntini.vercel.app](https://zuntini.vercel.app/)
- **Repositório:** [github.com/marcondesjm/zuntini](https://github.com/marcondesjm/zuntini)
- **Tecnologias:** HTML, CSS e JavaScript, com fontes Manrope e Syne armazenadas localmente.

O site conta com layout responsivo, menu para celular, animações adaptadas à preferência por movimento reduzido e páginas de acessibilidade, privacidade e cookies.

## Executar localmente

Para testar o site e a rota de contato, execute nesta pasta com PHP 8.1 ou superior e a extensão cURL com suporte a SMTP e TLS:

```sh
php -S localhost:4183
```

Depois, acesse `http://localhost:4183`.

## Configurar o e-mail do formulário

O formulário usa `POST /api/enviar-contato.php`. O projeto inclui um runtime comunitário de PHP para a Vercel. Adicione estas variáveis de ambiente no projeto e faça um novo deploy:

- `SMTP_HOST` — nome do servidor SMTP, sem protocolo ou porta.
- `SMTP_PORT` — `587` para STARTTLS (padrão) ou `465` para TLS implícito.
- `SMTP_USERNAME` e `SMTP_PASSWORD` — credenciais SMTP do provedor.
- `CONTACT_FROM_EMAIL` — endereço remetente autorizado pelo provedor SMTP.
- `CONTACT_TO_EMAIL` — endereço do escritório que recebe as mensagens.

O endereço preenchido pelo visitante fica no campo de resposta do e-mail. Enquanto o envio estiver indisponível, o formulário oferece a opção de copiar a mensagem.

## Pontos pendentes

- Confirmar as informações profissionais e os canais oficiais do escritório.
- Definir o contato para solicitações de privacidade e revisar as políticas de privacidade e cookies.
- Quando houver domínio próprio, atualizar as configurações de SEO e compartilhamento. Consulte `PUBLICACAO.md` para a lista de verificações.
- As fontes Mumford e Scale VF poderão ser aplicadas caso os arquivos e as licenças para uso na web sejam disponibilizados.

## Desenvolvimento

**MJM Digital**

- Instagram: [@marcondes.machado.oficial](https://www.instagram.com/marcondes.machado.oficial/)
- WhatsApp: [(48) 99602-9392](https://wa.me/5548996029392)
