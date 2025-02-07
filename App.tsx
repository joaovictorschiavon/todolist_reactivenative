import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Modal,
  Pressable,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import alert from './alert'

type Category = 'casa' | 'trabalho' | 'outros';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  category: Category;
}

interface CategoryColors {
  background: string;
  border: string;
  text: string;
}

const STORAGE_KEY = '@todos';

export default function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<Category>('outros');
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  useEffect(() => {
    loadTodos();
    console.log(todos);
    if (todos.length == 0) {
      initialTodos();
    }
  }, []);

  const initialTodos = async () => {
    setLoading(true);
    try {
      const initialTodos: Todo[] = new Array<Todo>();
      for (let i = 0; i < 3; i += 1) {
        const resposta = await fetch(`https://jsonplaceholder.typicode.com/todos/${i+1}`);
        const newApiTodo = await resposta.json();
        const newTodo: Todo = {
          id: String(i + 1),
          text: newApiTodo.title,
          completed: false,
          category: "outros",
        }; 
        initialTodos.push(newTodo)
      }
      const updatedTodos = [...todos, ...initialTodos];
      setTodos(updatedTodos);
      await saveTodos(updatedTodos);
    } catch (error) {
      Alert.alert('Error', 'Falha ao carregar tarefa da API');
    } finally {
      setLoading(false);
    }
  }

  const loadTodos = async () => {
    try {
      const storedTodos = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedTodos) {
        setTodos(JSON.parse(storedTodos));
      }
    } catch (error) {
      Alert.alert('Erro', 'Falha ao carregar as tarefas');
    } finally {
      setLoading(false);
    }
  };

  const saveTodos = async (updatedTodos: Todo[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTodos));
    } catch (error) {
      Alert.alert('Erro', 'Falha ao salvar as tarefas');
    }
  };

  const getCategoryColor = (category: Category): CategoryColors => {
    switch (category) {
      case 'casa':
        return {
          background: '#E8F5E9',
          border: '#4CAF50',
          text: '#2E7D32'
        };
      case 'trabalho':
        return {
          background: '#E3F2FD',
          border: '#2196F3',
          text: '#1565C0'
        };
      case 'outros':
        return {
          background: '#FFF3E0',
          border: '#FF9800',
          text: '#E65100'
        };
    }
  };

  const addTodo = async () => {
    if (inputText.trim().length === 0) {
      Alert.alert('Error', 'Entre uma tarefa válida');
      return;
    }

    const unparsedStoredTodos = await AsyncStorage.getItem(STORAGE_KEY);
    let storedTodos;

    if (unparsedStoredTodos) {
      storedTodos = JSON.parse(unparsedStoredTodos);
    }

    let lastTodo = 0;

    if (storedTodos) {
      for (const td of storedTodos) {
        if (lastTodo < Number(td.id)) {
          lastTodo = Number(td.id);
        }
      }
    }

    const newTodo: Todo = {
      id: String(lastTodo + 1),
      text: inputText.trim(),
      completed: false,
      category: selectedCategory,
    };

    const updatedTodos = [...todos, newTodo];
    setTodos(updatedTodos);
    await saveTodos(updatedTodos);
    setInputText('');
  };

  const toggleTodo = async (id: string) => {
    const updatedTodos = todos.map((todo) =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    setTodos(updatedTodos);
    await saveTodos(updatedTodos);
  };

  const deleteTodo = async (id: string) => {
    const updatedTodos = todos.filter((todo) => todo.id !== id);
    setTodos(updatedTodos);
    await saveTodos(updatedTodos);
  };

  const clearCompleted = () => {
    alert(
      'Limpar Concluídos',
      'Tem certeza que deseja remover todas as tarefas concluídas?',
      [
        {
          text: 'Cancelar',
          onPress: () => console.log(),
          style: 'cancel'
        },
        {
          text: 'Sim',
          onPress: async () => {
            const updatedTodos = todos.filter(todo => !todo.completed);
            await saveTodos(updatedTodos);
            setTodos(updatedTodos);
          }
        }
      ]
    );
  };
  
  const clearAll = () => {
    alert(
      'Limpar Tudo',
      'Tem certeza que deseja remover todas as tarefas?',
      [
        {
          text: 'Cancelar',
          onPress: () => console.log(),
          style: 'cancel'
        },
        {
          text: 'Sim',
          onPress: async () => {
            await saveTodos([]);
            setTodos([]);
          }
        }
      ]
    );
  };

  const renderItem = ({ item }: { item: Todo }) => {
    const colors = getCategoryColor(item.category);
    return (
      <View 
        style={[
          styles.todoItem,
          {
            backgroundColor: colors.background,
            borderLeftWidth: 4,
            borderLeftColor: colors.border,
          }
        ]}
      >
        <TouchableOpacity
          style={styles.todoTextContainer}
          onPress={() => toggleTodo(item.id)}
        >
          <Text
            style={[
              styles.todoText,
              { color: colors.text },
              item.completed && styles.completedTodoText,
            ]}
          >
            {item.text}
          </Text>
          <Text style={[styles.categoryText, { color: colors.text }]}>
            {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.deleteButton, { backgroundColor: colors.border }]}
          onPress={() => deleteTodo(item.id)}
        >
          <Text style={styles.deleteButtonText}>Excluir</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const CategoryModal = () => (
    <Modal
      animationType="fade"
      transparent={true}
      visible={showCategoryModal}
      onRequestClose={() => setShowCategoryModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Selecione a Categoria</Text>
          {['casa', 'trabalho', 'outros'].map((category) => {
            const colors = getCategoryColor(category as Category);
            return (
              <Pressable
                key={category}
                style={[
                  styles.categoryButton,
                  {
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                    borderWidth: 1,
                    opacity: selectedCategory === category ? 1 : 0.6,
                  },
                ]}
                onPress={() => {
                  setSelectedCategory(category as Category);
                  setShowCategoryModal(false);
                }}
              >
                <Text style={[styles.categoryButtonText, { color: colors.text }]}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text>Carregando tarefas...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar style="auto" />
      <Text style={styles.title}>Lista de Tarefas</Text>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Adicionar nova tarefa..."
          onSubmitEditing={addTodo}
        />
        <TouchableOpacity
          style={[
            styles.categorySelectButton,
            {
              backgroundColor: getCategoryColor(selectedCategory).background,
              borderColor: getCategoryColor(selectedCategory).border,
              borderWidth: 1,
            }
          ]}
          onPress={() => setShowCategoryModal(true)}
        >
          <Text style={[
            styles.categorySelectText,
            { color: getCategoryColor(selectedCategory).text }
          ]}>
            {selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[
            styles.addButton,
            {
              backgroundColor: getCategoryColor(selectedCategory).border
            }
          ]} 
          onPress={addTodo}
        >
          <Text style={styles.addButtonText}>Adicionar</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.clearButton, { backgroundColor: '#FF9800' }]}
          onPress={clearCompleted}
        >
          <Text style={styles.clearButtonText}>Limpar Concluídos</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.clearButton, { backgroundColor: '#F44336' }]}
          onPress={clearAll}
        >
          <Text style={styles.clearButtonText}>Limpar Tudo</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={todos}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        style={styles.list}
      />

      <CategoryModal />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: 50,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginRight: 10,
    backgroundColor: 'white',
  },
  categorySelectButton: {
    paddingHorizontal: 10,
    justifyContent: 'center',
    borderRadius: 8,
    marginRight: 10,
  },
  categorySelectText: {
    fontWeight: 'bold',
    fontSize: 12,
  },
  addButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    justifyContent: 'center',
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    justifyContent: 'space-between',
  },
  clearButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  clearButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  list: {
    flex: 1,
    paddingHorizontal: 20,
  },
  todoItem: {
    flexDirection: 'row',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  todoTextContainer: {
    flex: 1,
  },
  todoText: {
    fontSize: 16,
    fontWeight: '500',
  },
  categoryText: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  completedTodoText: {
    textDecorationLine: 'line-through',
    opacity: 0.7,
  },
  deleteButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  categoryButton: {
    width: '100%',
    padding: 15,
    borderRadius: 8,
    marginVertical: 5,
  },
  categoryButtonText: {
    textAlign: 'center',
    fontWeight: 'bold',
  },
});