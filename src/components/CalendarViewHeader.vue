<template>
	<div class="cv-header">
		<div class="cv-header-nav">
			<button
				:disabled="!headerProps.previousYear"
				class="previousYear"
				@click.prevent="onInput(headerProps.previousYear)"
			>
				&lt;&lt;
			</button>
			<button
				:disabled="!headerProps.previousPeriod"
				class="previousPeriod"
				@click.prevent="onInput(headerProps.previousPeriod)"
			>
				&lt;
			</button>
			<button
				class="currentPeriod"
				@click.prevent="onInput(headerProps.currentPeriod)"
			>
				{{ headerProps.currentPeriodLabel }}
			</button>
			<button
				:disabled="!headerProps.nextPeriod"
				class="nextPeriod"
				@click.prevent="onInput(headerProps.nextPeriod)"
			>
				&gt;
			</button>
			<button
				:disabled="!headerProps.nextYear"
				class="nextYear"
				@click.prevent="onInput(headerProps.nextYear)"
			>
				&gt;&gt;
			</button>
		</div>
		<div class="periodLabel">
			<slot name="label">{{ headerProps.periodLabel }}</slot>
		</div>
	</div>
</template>
<script>
export default {
	name: "CalendarViewHeader",
	props: {
		headerProps: {
			type: Object,
			required: true,
		},
	},
	methods: {
		onInput(d) {
			this.$emit("input", d)
		},
	},
}
</script>
<style>
.cv-header {
	display: flex;
	flex: 0 1 auto;
	flex-flow: row nowrap;
	align-items: center;
	min-height: 2.5em;
	border-width: 1px 1px 0 1px;
}

.cv-header .periodLabel {
	display: flex;
	flex: 1 1 auto;
	flex-flow: row nowrap;
	min-height: 1.5em;
	line-height: 1;
	font-size: 1.5em;
}

.cv-header,
.cv-header button {
	border-style: solid;
	border-color: #ddd;
}

.cv-header-nav,
.cv-header .periodLabel {
	margin: 0.1em 0.6em;
}

.cv-header-nav button,
.cv-header .periodLabel {
	padding: 0.4em 0.6em;
}

.cv-header button {
	box-sizing: border-box;
	line-height: 1em;
	font-size: 1em;
	border-width: 1px;
}
</style>
