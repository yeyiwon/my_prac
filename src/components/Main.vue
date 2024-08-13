<template>
  <v-container fluid style="padding: 20px 20px !important">
    <div class="header">
      <v-icon color="black">calendar_month</v-icon>
      <span>할 일</span>
    </div>

    <v-row>
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>
            <v-btn @click="previousMonth" icon>
              <v-icon>mdi-chevron-left</v-icon>
            </v-btn>
            <v-spacer></v-spacer>
            <span>{{ monthYear }}</span>
            <v-spacer></v-spacer>
            <v-btn @click="nextMonth" icon>
              <v-icon>mdi-chevron-right</v-icon>
            </v-btn>
          </v-card-title>
          <v-card-subtitle>
            <v-calendar
              style="padding: 10px 10px;"
              v-model="selectedDate"
              type="month"
              @click:day="handleDayClick"
              :events="events"
              :event-color="getEventColor"
              color="primary"
            ></v-calendar>
          </v-card-subtitle>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card>
          <v-card-text>
            <h2 class="h2_box">
              <v-icon color="black">schedule</v-icon>
              {{ selectedDate }}
            </h2>
            <v-divider></v-divider>

            <v-text-field
              outlined
              v-model="localNewTodo"
              label="할 일 추가"
              @keyup.enter="addTodo"
            ></v-text-field>

            <!-- 할 일이 없을 표시 -->
            <v-list v-if="todosForSelectedDate.length === 0">
              <v-list-item>
                <v-list-item-content>
                  <span>할 일이 없어요! 추가해보세요!</span>
                </v-list-item-content>
              </v-list-item>
            </v-list>

            <!-- 할 일 리스트 -->
            <v-list v-else>
              <v-list-item
                class="item_todo"
                v-for="(todo, index) in todosForSelectedDate"
                :key="index"
              >
                <v-list-item-content>
                  <v-checkbox
                    color="pink"
                    v-model="todo.done"
                    :label="todo.text"
                    @change="updateTodos(todo)"
                  ></v-checkbox>
                </v-list-item-content>
                <v-list-item-action>
                  <v-btn icon @click="removeTodo(index)">
                    <v-icon color="#263238">mdi-delete</v-icon>
                  </v-btn>
                </v-list-item-action>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapState, mapActions } from 'vuex';

export default {
  data() {
    return {
      currentDate: new Date().toISOString().substr(0, 10),
      selectedDate: new Date().toISOString().substr(0, 10),
    };
  },
  computed: {
    ...mapState(['todos']),
    
    monthYear() {
      const date = new Date(this.currentDate);
      return date.toLocaleString('default', { month: 'long', year: 'numeric' });
    },
    
    localNewTodo: {
      get() {
        return this.$store.state.newTodo;
      },
      set(value) {
        this.$store.dispatch('setNewTodo', value);
      }
    },
    
    todosForSelectedDate() {
      return this.$store.state.todos[this.selectedDate] || [];
    },
    
    events() {
      return Object.keys(this.$store.state.todos).map(date => ({
        name: this.$store.state.todos[date].map(todo => todo.text).join(', '),
        start: new Date(date),
        end: new Date(date),
      }));
    }
  },
  methods: {
    ...mapActions(['addTodo', 'removeTodo', 'clearTodos', 'saveTodos', 'setCurrentDate']),
    
    handleDayClick({ date }) {
      const formattedDate = new Date(date).toISOString().substr(0, 10);
      this.selectedDate = formattedDate;
      this.$store.dispatch('handleDayClick', { date: formattedDate });
    },
    
    updateTodos(todo) {
      this.$store.commit('UPDATE_TODOS');
    },
    
    checkTodosForDate(date) {
      const todosForDate = this.$store.state.todos[date] || [];
      return todosForDate.every(todo => todo.done) ? 'red' : 'white';
    },
    
    getEventColor(date) {
      return this.checkTodosForDate(date.start.toISOString().substr(0, 10)) ? 'red' : 'white';
    },
    
    addTodo() {
      if (this.localNewTodo.trim() && this.selectedDate) {
        // addTodo 액션에 localNewTodo와 selectedDate를 인자로 전달
        this.$store.dispatch('addTodo', { text: this.localNewTodo, date: this.selectedDate });
        this.localNewTodo = ''; // 입력 필드 비우기
      }
    },
    
    removeTodo(index) {
      if (this.selectedDate) {
        this.$store.dispatch('removeTodo', { date: this.selectedDate, index });
      }
    },
    
    previousMonth() {
      const date = new Date(this.currentDate);
      date.setMonth(date.getMonth() - 1);
      this.setCurrentDate(date.toISOString().substr(0, 10));
    },
    
    nextMonth() {
      const date = new Date(this.currentDate);
      date.setMonth(date.getMonth() + 1);
      this.setCurrentDate(date.toISOString().substr(0, 10));
    },
    
    setCurrentDate(dateString) {
      this.currentDate = dateString;
      this.selectedDate = dateString; // 동기화
    }
  },
  watch: {
    selectedDate(newDate) {
      this.handleDayClick({ date: newDate });
    }
  },
  mounted() {
    this.handleDayClick({ date: this.currentDate });
  }
};
</script>

<style>
.v-card {
  border-radius: 20px !important;
}
.item_todo {
  box-shadow: 1px 0px 5px 0px rgba(0,0,0,0.1);
  background: #ccc;
  color: #fff !important;
  font-weight: bold;
  border-radius: 20px;
  margin-bottom: 10px;
}
.v-text-field {
  margin-top: 10px;
}
.h2_box {
  padding: 15px 0;
  box-sizing: border-box;
}
</style>
