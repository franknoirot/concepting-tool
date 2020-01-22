<script context='module'>
	const currQueryParams = Array.from((new URL(document.location)).searchParams.entries())
</script>

<script>
	import { onMount } from 'svelte'
	import { loadIFramePromise, getIFrameCustomCSS } from './utils/iframeStyling'
	let previewFrame, previewStyles
	let paramStyles = ''

	currQueryParams.forEach(param => {
		if (param[0].substr(0,2) === '--') {
			paramStyles += `${ param[0] }: #${ param[1] }; `
		}
	})

	onMount(async () => {
		previewFrame.src = currQueryParams.find(item => item[0] === 'url')
			? `${window.location.origin}/pages/${ currQueryParams.find(item => item[0] === 'url')[1] }`
			: ''

		// WAIT FOR IFRAME TO LOAD
		const previewFrameLoaded = await loadIFramePromise(previewFrame).catch(err => console.error(err))

		// EXTRACT BODY, :ROOT, AND * CSS VARIABLES
		previewStyles = getIFrameCustomCSS(previewFrame)
		console.log('previewStyles = ', previewStyles)

		// TODO: CREATE UI CONTROLS FOR EACH TOP LEVEL VARIABLE BASED ON TYPE

		// TODO: WRITE TO URL AS QUERY PARAMS WHEN EDITING ANY CSS VARIABLE VALUES

		// TODO: LOAD QUERY PARAMS AND ASSIGN TO IFRAME PAGE BY CREATING A NEW CSS FILE AND INSERTING AT END OF HEAD TAG

	})
</script>

<main style={ paramStyles }>
	<h1>Query Param Test</h1>
	<section>
		<h2>URL params</h2>
		<table>
			<tbody>
				<tr><th>Key</th><th>Value</th></tr>
				{#each currQueryParams as param, i}
				<tr>
					<td>{ param[0] }</td>
					<td>{ param[1] }</td>
				</tr>
				{/each}
			</tbody>
		</table>
	</section>
	<section>
		<h2>Theme Controls Available on This Page</h2>
		{#if previewStyles instanceof Array}
		<table>
			<tbody>
				<tr><th>Variable</th><th>Value</th></tr>
				{#each previewStyles as style, i}
				<tr>
					<td>{ style[0] }</td>
					<td>{ style[1] }</td>
				</tr>
				{/each}
			</tbody>
		</table>
		{/if}
	</section>
	{#if currQueryParams.find(item => item[0] === 'url')}
	<iframe title='page-preview' bind:this={ previewFrame } width='80%' height='600' allowfullscreen>
		<p>Sorry, your iframe isn't loading!</p>
	</iframe>
	{/if}
</main>

<style>
	main {
		--h-color: #ff3e00;
		--body-color: black;
		--bg: white;

		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
		background: var(--bg);
		color: var(--body-color);
		min-height: 100%;
	}

	h1 {
		color: var(--h-color);
		text-transform: uppercase;
		font-size: 4em;
		font-weight: 100;
	}

	section {
		margin: 2em 0;
	}

	table {
		width: fit-content;
		margin: auto;
		border-collapse: collapse;
	}

	td, th {
		border: solid 1px;
		padding: .3em 1em;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>