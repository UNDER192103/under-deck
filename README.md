# Under Deck

<div align="center">
  <img src="Domain/src/img/UDIx256.ico" alt="Under Deck Logo" width="128" height="128">
  
  **Uma ferramenta poderosa para streamers e usuários em geral**
  
  [![Version](https://img.shields.io/badge/version-2.0.10-blue.svg)](https://github.com/UNDER192103/under-deck/releases)
  [![License](https://img.shields.io/badge/license-ISC-green.svg)](LICENSE.md)
  [![Electron](https://img.shields.io/badge/Electron-37.2.0-47848f.svg)](https://electronjs.org/)
</div>

## 📋 Sobre o Projeto

O Under Deck é um aplicativo desktop desenvolvido em Electron que foi criado principalmente para ajudar streamers, mas também é útil para uso geral. Ele oferece uma interface intuitiva para gerenciar aplicações, criar atalhos personalizados e controlar seu computador remotamente através de uma interface web.

## ✨ Principais Funcionalidades

### 🚀 **Gerenciamento de Aplicações**
- Registre executáveis de aplicativos
- Adicione URLs de websites
- Inclua arquivos de áudio
- Execute comandos CMD personalizados
- Personalize nomes e ícones de exibição

### 🌐 **Web Under Deck**
- Interface web para controle remoto (apenas redes locais)
- Acesso via URL ou QR Code
- Execute aplicações do seu computador remotamente
- Ideal para streamers controlarem setup à distância

### ⌨️ **Teclas de Atalho**
- Crie atalhos de teclado personalizados
- Suporte para aplicações, áudios, URLs e comandos CMD
- Execução rápida e eficiente
- Exemplo: CTRL + D para abrir Discord

### 📱 **Páginas Web Integradas**
- Abra websites dentro do Under Deck
- Navegação sem necessidade de browser externo
- Acesso rápido a sites frequentemente utilizados

### ⚙️ **Configurações Avançadas**
- Habilitação/desabilitação de atalhos
- Configuração de porta para Web Under Deck
- Personalização de interface
- Configurações de rede local

## 🛠️ Tecnologias Utilizadas

- **Electron** 37.2.0 - Framework principal
- **Node.js** - Runtime JavaScript
- **Express** - Servidor web interno
- **Socket.io** - Comunicação em tempo real
- **Discord RPC** - Integração com Discord
- **RobotJS** - Automação de sistema
- **OBS WebSocket** - Integração com OBS Studio

## 📦 Instalação

### Pré-requisitos
- Node.js (versão 16 ou superior)
- npm ou yarn

### Instalação via Release
1. Acesse a página de [Releases](https://github.com/UNDER192103/under-deck/releases)
2. Baixe a versão mais recente para Windows
3. Execute o instalador e siga as instruções

### Desenvolvimento Local
```bash
# Clone o repositório
git clone https://github.com/UNDER192103/under-deck.git

# Entre no diretório
cd under-deck

# Instale as dependências
npm install

# Execute o aplicativo
npm start
```

## 🔧 Scripts Disponíveis

```bash
# Iniciar aplicação
npm start

# Build para produção
npm run build

# Build específico para Windows
npm run build:win

# Rebuild de módulos nativos
npm run rebuild
```

## 🎯 Casos de Uso

### Para Streamers
- **Controle Remoto**: Use seu celular para controlar aplicações durante stream
- **Atalhos Rápidos**: Acesse rapidamente Discord, OBS, jogos, etc.
- **Organização**: Mantenha todas as ferramentas organizadas em um só lugar
- **Automação**: Execute comandos e scripts personalizados

### Para Usuários Gerais
- **Produtividade**: Acesso rápido a aplicações frequentes
- **Automação**: Execute tarefas repetitivas com atalhos
- **Organização**: Centralize o acesso a websites e aplicações
- **Controle Remoto**: Controle seu PC de outros dispositivos na rede

## 🔒 Segurança

- ✅ Funciona apenas em redes locais (Wi-Fi/Ethernet)
- ✅ Sem exposição à internet externa
- ✅ Controle total sobre permissões de acesso
- ✅ Interface web protegida por rede local

## 🤝 Contribuindo

Contribuições são sempre bem-vindas! Para contribuir:

1. Faça um Fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📞 Suporte

- **GitHub**: [Issues](https://github.com/UNDER192103/under-deck/issues)
- **Discord**: under_nouzen
- **Email**: undernouzen@gmail.com

## 📄 Licença

Este projeto está sob a licença ISC. Veja o arquivo [LICENSE.md](LICENSE.md) para mais detalhes.

## 🚧 Status do Desenvolvimento

Algumas funcionalidades ainda estão em desenvolvimento e passarão por mudanças em breve. Acompanhe as releases para novidades!

---

<div align="center">
  Desenvolvido com ❤️ por <a href="https://github.com/UNDER192103">UNDER</a>
</div>