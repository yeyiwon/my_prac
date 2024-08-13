<template>
  <div style="margin: 0 auto; padding: 1em;">
    <div class="header">
      <v-icon color="pink"> place </v-icon>
      <span>내 주변 갈만한 곳 </span>
    </div>
    <!-- <div class="search_box_area">
      <div class="search-box">
        <v-text-field
          v-model="keyword"
          prepend-inner-icon="mdi-magnify"
          label="키워드 검색"
          @keyup.enter="searchPlaces"
          solo
        ></v-text-field>
      </div>
    </div> -->
    <div class="category-chips">
      <v-chip
        v-for="cat in categories"
        :key="cat.value"
        :class="{'active-chip': category === cat.value}"
        @click="selectCategory(cat.value)"
      >
        {{ cat.label }}
      </v-chip>
    </div>
    <div id="map" ref="map"></div>
    <div style="padding: 20px 20px;">
      <v-row ref="scrollContainer" class="scrollable-list">
        <v-col v-for="(place, index) in places" :key="index" cols="12">
          <v-card class="place-card" @click="moveToMarker(place)">
            <v-icon color="pink"> place </v-icon>
            <v-card-title>{{ place.place_name }}</v-card-title>
            <v-card-subtitle>{{ place.road_address_name }}</v-card-subtitle>
            <v-card-actions>
              <v-btn
                class="bookmark_btn"
                @click.stop="toggleBookmark(place)"
                icon
                fab
                absolute
              >
                <v-icon
                  size="30"
                  :color="isBookmarked(place.id) ? '#000000' : '#000000'"
                >
                  {{ isBookmarked(place.id) ? 'mdi-bookmark' : 'mdi-bookmark-outline' }}
                </v-icon>
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
        <v-col v-if="loading" cols="12">
          <v-card class="loading-card">
            <v-progress-circular indeterminate color="black"></v-progress-circular>
            <v-card-title class="text-center">Loading...</v-card-title>
          </v-card>
        </v-col>
      </v-row>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      currentLocationDescription: "", // 현재 위치 설명
      keyword: "",
      places: [],
      map: null,
      markers: [],
      currentLocationMarker: null,
      currentLocation: null,
      page: 1,
      loading: false,
      hasMore: true,
      category: '', // 선택한 카테고리
      categories: [
        { label: '카페', value: 'cafe' },
        { label: '음식점', value: 'restaurant' },
        { label: '편의점', value: 'convenience' },
        { label: '관광명소', value: 'attraction' },
        { label: '숙박', value: 'accommodation' },
        { label: '문화공간', value: 'space' },
      ],
      categoryImages: {
        cafe: require('@/assets/icon/cafe.png'),
        restaurant: require('@/assets/icon/restaurant.png'),
        convenience: require('@/assets/icon/convenience.png'),
        attraction: require('@/assets/icon/map.png'),
        accommodation: require('@/assets/icon/hotel.png'),
        space: require('@/assets/icon/space.png')
      },
      categoryQueries: {
        cafe: 'CE7',
        restaurant: 'FD6',
        convenience: 'CS2',
        attraction: 'AT4',
        accommodation: 'AD5',
        space: 'CT1'
      },
    };
  },
  methods: {
    
    toggleBookmark(place) {
      let bookmarks = JSON.parse(localStorage.getItem('bookmarks')) || [];
      const index = bookmarks.findIndex(b => b.id === place.id);

      if (index !== -1) {
        bookmarks.splice(index, 1); // 북마크 삭제
      } else {
        bookmarks.push(place); // 북마크 추가
      }

      localStorage.setItem('bookmarks', JSON.stringify(bookmarks));

      // 북마크 상태를 강제로 업데이트
      this.$nextTick(() => {
        this.places = [...this.places]; // 강제로 re-render
      });
    },
    isBookmarked(placeId) {
      const bookmarks = JSON.parse(localStorage.getItem('bookmarks')) || [];
      return bookmarks.some(b => b.id === placeId);
    },
  loadKakaoMapsScript() {
      if (typeof kakao === 'undefined' || typeof kakao.maps === 'undefined') {
        const script = document.createElement('script');
        script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=1bf838d8451c6f7731db84965b21aa10&autoload=false`;
        script.onload = () => {
          kakao.maps.load(() => {
            this.initMap();
            this.getCurrentLocation();
          });
        };
        script.onerror = () => {
          console.error('Kakao 지도 API 스크립트 로드 실패');
        };
        document.head.appendChild(script);
      } else {
        this.initMap();
        this.getCurrentLocation();
      }
    },
    initMap() {
      if (typeof kakao === 'undefined' || typeof kakao.maps === 'undefined') {
        console.error('Kakao 지도 API가 로드되지 않았습니다.');
        return;
      }
      const mapContainer = this.$refs.map;
      const options = {
        center: new kakao.maps.LatLng(33.450701, 126.570667),
        level: 3,
      };
      this.map = new kakao.maps.Map(mapContainer, options);
    },
async searchPlaces() {
  if (this.loading || !this.hasMore) return;

  this.loading = true;

  if (typeof kakao === 'undefined' || typeof kakao.maps === 'undefined' || typeof kakao.maps.services === 'undefined') {
    console.error('Kakao 지도 API가 로드되지 않았습니다.');
    this.loading = false;
    return;
  }

  const ps = new kakao.maps.services.Places();
  const options = {
    location: this.currentLocation,
    radius: 5000,
    page: this.page,
    query: this.keyword
  };

  const category = this.getCategoryQuery();

  ps.categorySearch(category, (data, status, pagination) => {
    if (status === kakao.maps.services.Status.OK) {
      this.places = [...this.places, ...data];
      this.page += 1;
      this.hasMore = pagination.hasNextPage;
      this.clearMarkers();
      this.displayMarkers();
    } else {
      this.hasMore = false;
    }
    this.loading = false;
  }, options);
},
    getCategoryQuery() {
      return this.categoryQueries[this.category] || '';
    },
    displayMarkers() {
      this.places.forEach((place) => {
        const markerPosition = new kakao.maps.LatLng(place.y, place.x);
        const imageSrc = this.categoryImages[this.category];
        const imageSize = new kakao.maps.Size(30, 30);
        const imageOption = { offset: new kakao.maps.Point(15, 30) };

        const markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize, imageOption);

        const marker = new kakao.maps.Marker({
          position: markerPosition,
          image: markerImage,
        });
        marker.setMap(this.map);
        this.markers.push(marker);

        kakao.maps.event.addListener(marker, 'click', () => {
          this.map.setCenter(markerPosition);
        });
      });
    },
    clearMarkers() {
      this.markers.forEach((marker) => marker.setMap(null));
      this.markers = [];
    },
    moveToMarker(place) {
      // 장소의 위치로 지도 이동
      const position = new kakao.maps.LatLng(place.y, place.x);
      this.map.setCenter(position);
    },
    moveToDetail(place, event) {
      event.stopPropagation(); // 카드 클릭 이벤트와 충돌 방지
      // 상세 페이지로 이동
      this.$router.push({ name: 'PlaceDetail', params: { id: place.id } });
    },
onScroll() {
  const container = this.$refs.scrollContainer;
  if (!container) {
    return;
  }
  if (container.scrollTop + container.clientHeight >= container.scrollHeight - 10) {
    this.searchPlaces();
  }
},
    selectCategory(category) {
      this.category = category;
      this.places = [];
      this.page = 1;
      this.hasMore = true; // 카테고리 변경 시 다시 페이지를 초기화
      this.searchPlaces();
    },
async getCurrentLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        this.currentLocation = new kakao.maps.LatLng(lat, lng);

        this.currentLocationMarker = new kakao.maps.Marker({
          map: this.map,
          position: this.currentLocation,
          title: "현재 위치",
        });

        this.map.setCenter(this.currentLocation);

        const geocoder = new kakao.maps.services.Geocoder();
        geocoder.coord2Address(lat, lng, (result, status) => {
          if (status === kakao.maps.services.Status.OK) {
            const address = result[0].address;
            this.currentLocationDescription = `${address.region_3depth_name}`;
            this.searchPlaces(); // 현재 위치를 기준으로 장소 검색
          } else {
            console.error("주소를 가져오는 데 실패했습니다.");
          }
        });
      },
      (error) => {
        console.error("현재 위치를 가져올 수 없습니다.", error);
      }
    );
  } else {
    alert("브라우저가 위치 정보를 지원하지 않습니다.");
  }
},

    loadInitialPlaces() {
      this.category = '';
      this.searchPlaces();
    }
  },
  mounted() {
  this.loadKakaoMapsScript();
  this.loadInitialPlaces();
  
  this.$nextTick(() => {
    if (this.$refs.scrollContainer) {
      this.$refs.scrollContainer.addEventListener('scroll', this.onScroll);
    }
  });
},
    watch: {
    keyword: 'searchPlaces'
  },
  beforeDestroy() {
  const container = this.$refs.scrollContainer;
  if (container) {
    container.removeEventListener('scroll', this.onScroll);
  }
}
};
</script>

<style scoped>


.search_box_area {
  padding: 10px 10px;
}

.category-chips {
  display: flex;
  gap: 10px;
  background: #ffffff !important;
  padding: 10px 10px;
  box-sizing: border-box;
}

.v-chip {
  width: 100px;
  text-align: center;
}

.theme--light.v-chip {
  background: #fff !important;
  border: 1px solid #ccc;
  justify-content: center;
}

.category-chips .active-chip {
  background-color: #333 !important;
  color: white;
}

#map {
  width: 100%;
  height: 400px;
  margin-bottom: 10px;
}

.scrollable-list {
  max-height: 500px;
  overflow-y: auto;
}

.place-card {
  margin-bottom: 10px;
}

.place-card-img {
  object-fit: cover;
}

.loading-card {
  text-align: center;
}

.custom-infowindow {
  padding: 5px;
}

.bookmark_btn {
  top: 0;
  right: 0;
}
</style>
