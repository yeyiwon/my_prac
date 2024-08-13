<template>
  <v-app>
    <v-navigation-drawer app fixed
      v-model="drawer"
      absolute
      permanent
      left
      dark
      :mini-variant.sync="mini"
      @click="toggleDrawer"
    >
      <v-list-item class="profile-section" two-line>
        <!-- mini 상태에 따라 이미지 크기 조절 -->
        <v-avatar :size="mini ? 50 : 100" class="profile-avatar">
          <img :src="profileImageUrl" alt="Profile Picture" />
        </v-avatar>
        <!-- mini 상태에 따라 텍스트 숨김 -->
        <v-card-title v-if="!mini" class="profile-name">예이원님 안녕하세요</v-card-title>
        <v-btn v-if="!mini" class="profile-btn" dark @click.stop="triggerFileInput">프로필 사진 변경</v-btn>
        <input
          ref="fileInput"
          type="file"
          accept="image/*"
          style="display: none"
          @change="handleProfileImageChange"
        />
      </v-list-item>

      <v-divider></v-divider>

      <v-list dense>
        <v-list-item
          v-for="item in items"
          :key="item.title"
          :to="item.link"
          :class="{ 'active-list-item': isActive(item.link) }"
        >
          <v-list-item-icon>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-icon>

          <v-list-item-content>
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
      <v-divider></v-divider>
      <div class="today_area">
        <p> {{  formattedDate }}</p>
        <h4> {{ formattedTime }} </h4>
      </div>
        <div class="weader_wiset">
            <div v-if="weather">
              
              <h3> {{ weather.weather[0].description }} </h3>
              <span class="wb_temp">{{ weather.main.temp.toFixed(1) }}°C</span>
              <v-img :src="iconUrl" alt="날씨 아이콘" height="100"/>
              <h3>{{ weather.sys.country }}</h3>
              <span>{{ weather.name }}</span>
            </div>
            <div v-else>
              <span>날씨 정보를 불러오는 중입니다...</span>
            </div>
          </div>
          <v-divider> </v-divider>

    </v-navigation-drawer>

    <v-main>
      <router-view></router-view>
    </v-main>
  </v-app>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      currentTime: new Date(), // 현재 시간
      intervalId: null,
      drawer: true, // 서랍의 초기 상태
      mini: false, // 서랍이 미니모드인지 여부
      weather: null,
      apiKey: '6b95f3f89c4802214bd40f240fb2e26f',
      profileImageUrl: localStorage.getItem('profileImageUrl') || require('@/assets/gigthub.png'),
      items: [
        { link: '/', title: 'Home', icon: 'mdi-home-outline' },
        { link: '/map', title: 'Map', icon: 'mdi-map-outline' },
        { link: '/bookmark', title: 'Bookmark', icon: 'mdi-bookmark-outline' }
      ]
    };
  },
  computed: {
    iconUrl() {
      if (this.weather && this.weather.weather[0]) {
        return `http://openweathermap.org/img/wn/${this.weather.weather[0].icon}.png`;
      }
      return '';
    },
    formattedDate() {
      return this.currentTime.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    },
    formattedTime() {
      return this.currentTime.toLocaleTimeString('ko-KR');
    }
  },
methods: {
  async fetchWeather() {
    this.weather = null; // 로딩 중 상태
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&lang=kr&appid=${this.apiKey}`;
        
        try {
          console.log('Fetching weather data from URL:', url); // URL 확인
          const response = await axios.get(url);
          console.log('Weather data response:', response.data); // 응답 확인
          this.weather = response.data;
        } catch (error) {
          console.error("날씨 정보를 가져오는 데 문제가 발생했습니다.", error);
          this.weather = null; // 오류 상태
        }
      });
    } else {
      console.error("위치 정보를 가져올 수 없습니다.");
      this.weather = null; // 위치 정보 오류 상태
    }
  },
  updateTime() {
    this.currentTime = new Date(); // 현재 시간으로 업데이트
  },
  toggleDrawer() {
    this.mini = !this.mini;
  },
  triggerFileInput() {
    this.$refs.fileInput.click();
  },
  handleProfileImageChange(event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.profileImageUrl = e.target.result;
        localStorage.setItem('profileImageUrl', e.target.result);
      };
      reader.readAsDataURL(file);
    }
  },
  isActive(link) {
    return this.$route.path === link;
  }
},

mounted() {
  this.fetchWeather();
  this.intervalId = setInterval(this.updateTime, 1000); // 1초마다 updateTime 호출
},
  beforeDestroy() {
    clearInterval(this.intervalId); // 컴포넌트가 파괴되기 전에 setInterval을 정리
  }
};
</script>

<style>
.weader_wiset {
  color: #fff !important;
  height: 250px;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
}
.profile-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
  justify-content: center;
  align-items: center;
  padding-top: 20px;
}

.profile-name {
  font-size: 18px;
  font-weight: bold;
  text-align: center;
}

.profile-btn {
  font-size: 14px;
}

.active-list-item {
  background-color: #f5f5f5 !important;
  color: #333 !important;
}
v-main {
  padding: 0 !important;
  box-sizing: border-box;
}

.today_area {
  padding: 1em;
  box-sizing: border-box;
  text-align: center;
  font-size: 20px;
  color: #fff;
}
.today_area p {
  margin: 0 !important;
  letter-spacing: -1px;
  font-size: 25px;
}
.header {
  padding: 1em !important;
  font-size: 20px !important;
  font-weight: bold;
  box-sizing: border-box !important;
}
.theme-toggle-btn {
  position: fixed; /* 위치를 화면에 고정 */
  bottom: 16px;
  right: 16px;
  z-index: 10; /* 다른 요소 위에 배치 */
}
</style>
