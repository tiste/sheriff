<template>
    <v-app>
        <v-toolbar app dark color="primary" flat>
            <v-avatar
                :size="48"
                class="grey lighten-4"
                @click="home()"
            >
                <chuck-logo fill-style="#2175d1"></chuck-logo>
            </v-avatar>
            <v-toolbar-title v-text="title"></v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn flat v-if="token">Token: {{token}}</v-btn>
        </v-toolbar>

        <v-content>
            <div class="home-wrapper">
                <home-page></home-page>
                <login-page v-if="!token"></login-page>
                <features-page v-if="token && !feature.name" token="token"></features-page>
            </div>

            <sheriff-page v-if="feature.name && token" :feature="feature"></sheriff-page>
        </v-content>
    </v-app>
</template>

<script>
    import FEATURES from '../src/features/features';
    import ChuckLogo from './ChuckLogo.vue'
    import HomePage from './HomePage.vue'
    import FeaturesPage from './FeaturesPage.vue';
    import LoginPage from './LoginPage.vue';
    import SheriffPage from './SheriffPage.vue'


    export default {
        components: {
            SheriffPage,
            FeaturesPage,
            HomePage,
            ChuckLogo,
            LoginPage,
        },
        data() {
            return {
                FEATURES,
            }
        },
        methods : {
            home() {
                location.href = '/'
            }
        }
    }
</script>

<style>
    .home-wrapper {
        background: linear-gradient(#2175d1, #5694d6);
    }

    .avatar {
        overflow: hidden;
    }
</style>
