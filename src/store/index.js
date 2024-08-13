import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  state() {
    return {
      currentDate: new Date().toISOString().substr(0, 10),
      selectedDate: '',
      newTodo: '',
      todos: JSON.parse(localStorage.getItem('todos')) || {},
    };
  },
  mutations: {
    SET_CURRENT_DATE(state, date) {
      state.currentDate = date;
    },
    SET_SELECTED_DATE(state, date) {
      state.selectedDate = date;
    },
    SET_NEW_TODO(state, todo) {
      state.newTodo = todo;
    },
    ADD_TODO(state) {
      if (state.newTodo.trim() && state.selectedDate) {
        if (!state.todos[state.selectedDate]) {
          state.todos[state.selectedDate] = [];
        }
        state.todos[state.selectedDate].push({ text: state.newTodo, done: false });
        state.newTodo = '';
      }
    },
    REMOVE_TODO(state, { date, index }) {
      if (state.todos[date]) {
        state.todos[date].splice(index, 1);
        if (state.todos[date].length === 0) {
          delete state.todos[date];
        }
      }
    },
    CLEAR_TODOS(state) {
      if (state.selectedDate) {
        state.todos[state.selectedDate] = [];
      }
    },
    SAVE_TODOS(state) {
      localStorage.setItem('todos', JSON.stringify(state.todos));
    },
  },
  actions: {
    handleDayClick({ commit }, day) {
      commit('SET_SELECTED_DATE', day.date);
    },
    addTodo({ commit, dispatch }) {
      commit('ADD_TODO');
      dispatch('saveTodos');
    },
    removeTodo({ commit, dispatch }, { date, index }) {
      commit('REMOVE_TODO', { date, index });
      dispatch('saveTodos');
    },
    clearTodos({ commit, dispatch }) {
      commit('CLEAR_TODOS');
      dispatch('saveTodos');
    },
    saveTodos({ commit }) {
      commit('SAVE_TODOS');
    },
    setCurrentDate({ commit }, date) {
      commit('SET_CURRENT_DATE', date);
    },
    setNewTodo({ commit }, todo) {
      commit('SET_NEW_TODO', todo);
    },
  },
});
