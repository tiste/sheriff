<template>
    <v-app>
        <v-toolbar app dark color="primary" flat extended>
            <v-toolbar-title v-text="title"></v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn flat>Token: {{token}}</v-btn>
        </v-toolbar>

        <v-content style="margin-top: -64px; z-index: 10;">
            <v-layout justify-space-around wrap>
                <v-flex sm8>
                    <sheriff :feature="feature"></sheriff>
                </v-flex>
            </v-layout>
        </v-content>
    </v-app>
</template>

<script>
    import Sheriff from './Sheriff.vue';

    export default {
        components: {
            Sheriff,
        },
        data() {},
    }
</script>
