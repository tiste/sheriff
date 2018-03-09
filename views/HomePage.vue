<template>
    <v-app>
        <v-toolbar app dark color="primary" flat>
            <v-toolbar-title v-text="title"></v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn flat v-if="token">Token: {{token}}</v-btn>
        </v-toolbar>

        <v-content>
            <v-layout justify-space-around wrap v-if="token">
                <v-flex class="text-xs-center" v-for="(feature, i) in FEATURES" :key="i">
                    <v-btn color="primary" round large :href="i">{{i}}</v-btn>
                </v-flex>
            </v-layout>
            <v-layout justify-space-around wrap v-else>
                <v-flex sm5>
                    <v-card class="card--flex-toolbar">
                        <v-card-title>
                            <img src="/images/github.png" alt="Github" style="width: 150px; height: 150px;">
                        </v-card-title>
                        <v-card-title primary-title>
                            <div class="headline">Github</div>
                        </v-card-title>
                        <v-card-actions>
                            <v-btn color="primary" round large href="/github/login">Log in</v-btn>
                        </v-card-actions>
                    </v-card>
                </v-flex>
                <v-flex sm5>
                    <v-card class="card--flex-toolbar">
                        <v-card-title>
                            <img src="/images/gitlab.png" alt="Gitlab" style="width: 150px; height: 150px;">
                        </v-card-title>
                        <v-card-title primary-title>
                            <div class="headline">Gitlab</div>
                        </v-card-title>
                        <v-card-actions>
                            <v-btn color="primary" round large href="/gitlab/login">Log in</v-btn>
                        </v-card-actions>
                    </v-card>
                </v-flex>
            </v-layout>
        </v-content>
    </v-app>
</template>

<script>
    import FEATURES from '../lib/features';

    export default {
        data() {
            return {
                FEATURES,
            }
        },
    }
</script>
