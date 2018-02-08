<template>
    <v-card>
        <v-toolbar card color="white" prominent>
            <v-toolbar-title class="body-2 grey--text">{{feature.name}}</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn icon>
                <v-icon>more_vert</v-icon>
            </v-btn>
        </v-toolbar>
        <v-divider></v-divider>
        <v-card-text>
            <div>{{feature.description}}</div>

            <v-form v-model="valid" ref="form">
                <v-text-field
                    label="Repository"
                    v-model="repo"
                    required
                ></v-text-field>

                <v-text-field
                    v-for="(defaultValue, optionName) in feature.options"
                    :key="optionName"
                    :label="optionName"
                    v-model="options[optionName]"
                    required
                ></v-text-field>

                <v-btn
                    @click="submit"
                    :disabled="!valid"
                >
                    submit
                  </v-btn>
                <v-btn @click="clear">clear</v-btn>
            </v-form>
        </v-card-text>
    </v-card>
</template>

<script>
    export default {
        props: {
            feature: {
                type: Object,
            },
        },
        data() {
            return {
                valid: true,
                options: {},
                repo: '',
            };
        },
        methods: {
            submit() {
                if (this.$refs.form.validate()) {
                    axios.post('/setup', { name: this.feature.name, repo: this.repo, options: this.options })
                        .then(() => location.href = '/')
                        .catch(console.error);
                }
            },
            clear() {
                this.$refs.form.reset();
            }
        }
    }
</script>
