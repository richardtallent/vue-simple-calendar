<template>
	<div class="cv-header">
		<div class="cv-header-nav">
			<button :disabled="!headerProps.previousYear" class="previousYear" @click="onInput(headerProps.previousYear)">&lt;&lt;</button>
			<button :disabled="!headerProps.previousPeriod" class="previousPeriod" @click="onInput(headerProps.previousPeriod)">&lt;</button>
			<button :disabled="!headerProps.nextPeriod" class="nextPeriod" @click="onInput(headerProps.nextPeriod)">&gt;</button>
			<button :disabled="!headerProps.nextYear" class="nextYear" @click="onInput(headerProps.nextYear)">&gt;&gt;</button>
			<button class="currentPeriod" @click="onInput(headerProps.currentPeriod)">Today</button>
		</div>
		<div class="periodLabel">
			<slot name="label"/>
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
	min-height: 1.2em;
}

.cv-wrapper .periodLabel .startDay::before,
.cv-wrapper .periodLabel .endDay::before,
.cv-wrapper.period-month .periodLabel .startYear::before,
.cv-wrapper.period-month .periodLabel .endYear::before,
.cv-wrapper.period-year .periodLabel .endYear::before {
	content: "\00A0";
}

.cv-wrapper .periodLabel .endMonth::before,
.cv-wrapper.period-year:not(.periodCount-1) .periodLabel .endYear::before,
.cv-wrapper.period-week .periodLabel.singleMonth .endDay::before {
	content: "\00A0\2013\00A0";
}

.cv-wrapper.period-week .periodLabel .startYear::before,
.cv-wrapper.period-week .periodLabel .endYear::before {
	content: ",\00A0";
}

.cv-wrapper .periodLabel.singleYear .startYear,
.cv-wrapper .periodLabel.singleMonth .endMonth,
.cv-wrapper.period-month .periodLabel .startDay,
.cv-wrapper.period-month .periodLabel .endDay,
.cv-wrapper.period-year .periodLabel .startDay,
.cv-wrapper.period-year .periodLabel .endDay,
.cv-wrapper.period-year .periodLabel .startMonth,
.cv-wrapper.period-year .periodLabel .endMonth,
.cv-wrapper.period-month.periodCount-1 .periodLabel .endMonth,
.cv-wrapper.period-month.periodCount-1 .periodLabel .startYear,
.cv-wrapper.period-year.periodCount-1 .periodLabel .startYear {
	display: none;
}

/* Header navigation buttons */
.cv-header-nav .currentPeriod {
	display: none;
}

.cv-wrapper.past .cv-header-nav .currentPeriod,
.cv-wrapper.future .cv-header-nav .currentPeriod {
	display: inline-block;
}

.cv-header,
.cv-wrapper button,
.cv-header-days,
.cv-weeks,
.cv-week,
.cv-header-day,
.cv-day,
.cv-event {
	border-style: solid;
	border-color: #ddd;
}

.cv-header-nav,
.cv-header .periodLabel {
	margin: 0.4em 0.6em;
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
