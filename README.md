# Aplicativo de Lista de Tarefas

Este é um aplicativo de lista de tarefas desenvolvido com React Native, TypeScript e Expo, que permite aos usuários gerenciar suas tarefas diárias de forma organizada e eficiente.

## Funcionalidades

### Gerenciamento de Tarefas
- Adicionar novas tarefas com texto personalizado
- Marcar tarefas como concluídas/não concluídas
- Excluir tarefas individualmente
- Limpar todas as tarefas concluídas
- Limpar todas as tarefas de uma vez
- Possui persistência de dados em AsyncStorage
- Se não houver tarefas prévias, são gerados 3 tarefas de exemplo com ajuda da API JSONPlaceholder (https://jsonplaceholder.typicode.com/)

### Categorização
O aplicativo permite categorizar as tarefas em três diferentes categorias:
- Casa (verde)
- Trabalho (azul)
- Outros (laranja)

Cada categoria possui seu próprio esquema de cores para fácil identificação visual.

### Armazenamento Local
- As tarefas são salvas automaticamente no armazenamento local do dispositivo
- Carregamento automático das tarefas ao iniciar o aplicativo
- Persistência de dados entre sessões

## Dados Iniciais
O aplicativo carrega automaticamente 3 tarefas iniciais da API JSONPlaceholder quando não há tarefas existentes no armazenamento local.

### Dependências Principais
- React Native
- TypeScript
- Expo
- @react-native-async-storage/async-storage

### Ambiente de Desenvolvimento
Para executar o aplicativo em ambiente de desenvolvimento:

1. Clone o repositório
2. Instale as dependências:
```
npm install
```
3. Inicie o servidor de desenvolvimento:
```bash
npx expo start
```
4.Visualização:
Para acesso web acess: http://localhost:8081
Para acesso a aparelho móvel físico: 
    -Scanei o QR gerado com Expo Go (Android) ou o app de Câmera (iOS)

## Estrutura do Projeto
O aplicativo é construído como um único componente React Native que gerencia todo o estado e a lógica da aplicação. Os principais elementos incluem:

- Gerenciamento de estado com useState
- Efeitos colaterais com useEffect
- Componentes reutilizáveis para itens da lista
- Estilização com StyleSheet
- Tipagem TypeScript para maior segurança