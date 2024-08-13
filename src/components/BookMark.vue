<template>
  <v-container fluid>
    <div class="header">
      <v-icon color="pink"> bookmark </v-icon>
      <span> 저장한 곳 </span>
    </div>
    <v-row>
      <v-col v-for="(place, index) in bookmarkedPlaces" :key="index" cols="12">
        <v-card class="place-card">
          <v-card-title>{{ place.place_name }}</v-card-title>
          <v-card-subtitle>{{ place.road_address_name }}</v-card-subtitle>
          <v-card-actions>
            <v-btn @click="removeBookmark(place.id)" color="red" icon>
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  data() {
    return {
      bookmarkedPlaces: []
    };
  },
  created() {
    this.loadBookmarks();
  },
  methods: {
    loadBookmarks() {
      this.bookmarkedPlaces = JSON.parse(localStorage.getItem('bookmarks')) || [];
    },
    removeBookmark(placeId) {
      let bookmarks = JSON.parse(localStorage.getItem('bookmarks')) || [];
      bookmarks = bookmarks.filter(place => place.id !== placeId);
      localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
      this.bookmarkedPlaces = bookmarks;
    }
  }
};
</script>

<style scoped>

.place-card {
  position: relative;
  margin-bottom: 10px;
}

.v-card-actions {
  display: flex;
  justify-content: flex-end;
}
</style>
