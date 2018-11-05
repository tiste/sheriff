<template>
    <v-layout row wrap align-center justify-center>
        <v-flex d-flex xl2 lg3 md4 sm6 xs12 v-for="(i, featureKey) in FEATURES" :key="featureKey">
            <v-card class="card--flex-toolbar elevation-19 mx-5 my-4">
                <v-card-media class="mt-3" contain :src="`./images/${FEATURES[featureKey].img}`" height="150px">
                </v-card-media>
                <v-card-text>
                    <p class="text-xs-center mb-1 mt-2">{{FEATURES[featureKey].description}}</p>
                </v-card-text>
                <v-card-actions>
                    <v-btn v-if="token" color="primary" class="mx-auto mb-3" round large :href="featureKey">
                        Add new rule
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-flex>
    </v-layout>
</template>

<script>
    import FEATURES from '../src/features/features';

    export default {
        props: {
            token: {
                type: String,
                default: '',
            },
        },
        data() {
            return {
                FEATURES,
            }
        },
    }
</script>
