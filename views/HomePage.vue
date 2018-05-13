<template>
    <v-container>
        <v-layout wrap row align-center justify-center>
            <chuck-logo height="256px" fill-color="white" width="256px"></chuck-logo>
            <v-flex d-flex md10 sm6>
                <h1 class="display-3 white--text text-md-center">Secure your Pull Request</h1>
            </v-flex>
        </v-layout>
    </v-container>
</template>

<script>
    import FEATURES from '../lib/features';
    import ChuckLogo from './ChuckLogo.vue'

    export default {
        components: { ChuckLogo },
        data() {
            return {
                FEATURES,
            }
        },
    }
</script>
