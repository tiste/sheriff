<template>
    <v-container>
        <v-layout row wrap align-center justify-center>
            <v-flex d-flex md5 sm4 >
                <v-card class="card--flex-toolbar mx-5 elevation-19 my-4">
                    <v-card-media class="mt-3" contain src="./images/github.png" height="150px">
                    </v-card-media>
                    <v-card-text>
                        <p class="headline text-xs-center mb-1 mt-2">Github</p>
                    </v-card-text>
                    <v-card-actions>
                        <v-btn color="primary" class="mx-auto mb-3"  round large href="/github/login">Log in</v-btn>
                    </v-card-actions>
                </v-card>
            </v-flex>
            <v-flex d-flex md5 sm4>
                <v-card class="card--flex-toolbar mx-5 elevation-19 my-4" >
                    <v-card-media class="mt-3" contain src="./images/gitlab.png" height="150px">
                    </v-card-media>
                    <v-card-text>
                        <p class="headline text-xs-center mb-1 mt-2">Gitlab</p>
                    </v-card-text>
                    <v-card-actions>
                        <v-btn color="primary" class="mx-auto mb-3" round large href="/gitlab/login">Log in</v-btn>
                    </v-card-actions>
                </v-card>
            </v-flex>
        </v-layout>
    </v-container>
</template>


<script>
    export default {
        data() {
            return {}
        },
    }
</script>

