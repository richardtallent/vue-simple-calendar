<template>
	<div id="app">
		<h1 class="title" style="padding-top: 1rem; padding-left: 1rem">vue-simple-calendar v6.2.1</h1>
		<div style="padding-bottom: 1rem; padding-left: 1rem">
			<input type="radio" name="exampleMode" v-model="exampleMode" value="Simple" /> Simple
			<input type="radio" name="exampleMode" v-model="exampleMode" value="Full" /> Full
		</div>
		<example-full v-if="exampleMode == 'Full'" />
		<example-simple v-else />
	</div>
</template>
<script setup lang="ts">
import { ref } from "vue"
import ExampleFull from "./ExampleFull.vue"
import ExampleSimple from "./ExampleSimple.vue"

const exampleMode = ref("Simple")
</script>
