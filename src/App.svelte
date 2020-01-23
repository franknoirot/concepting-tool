<script context='module'>
	let availablePages = ['landing-page', 'blog-template']
	let currQueryParams = Array.from((new URL(document.location)).searchParams.entries())
</script>

<script>
	import { onMount, tick } from 'svelte'
	import { loadIFramePromise, getIFrameCustomCSS } from './utils/iframeStyling'
	import StyleControl from './components/StyleControl.svelte'

	let iFrameInitialized = currQueryParams.find(item => item[0] === 'url')
	let previewFrame, previewStyles
	let paramStyles = ''
	let isSidebarOpen = true

	$: queryStyles = currQueryParams.filter(param => param[0].startsWith('--'))

	let queryString = ''
	$: if (currQueryParams && previewStyles) {
		queryString = '?'+(`${(currQueryParams.find(param => param[0] === 'url')) ? 'url='+currQueryParams.find(param => param[0] === 'url')[1] : ''}${ (previewStyles) ? '&'+previewStyles.map(style => (encodeURIComponent(style[0])+'='+encodeURIComponent(style[1]))).join('&') : '' }`)
	}


	$: if (previewFrame && previewFrame.contentDocument && previewStyles) {
		const hasInjectedStyles = (previewFrame.contentDocument.documentElement.innerHTML).includes('style id="injected"')

		previewFrame.contentDocument.documentElement.innerHTML = (hasInjectedStyles)
			? (previewFrame.contentDocument.documentElement.innerHTML).replace(/<style id="injected">(.|\t|\r|\n)*<\/head>/, `<style id='injected'>
			body { ${ previewStyles.map(style => style[0] +': '+ style[1]).join('; ') } }
		</style>
		</head>`)
			: (previewFrame.contentDocument.documentElement.innerHTML).replace('</head>', `<style id='injected'>
			body { ${ previewStyles.map(style => style[0] +': '+ style[1]).join('; ') } }
		</style>
		</head>`)

	}

	onMount(handleMount)

	async function handleMount() {
		if (!currQueryParams.find(item => item[0] === 'url')) return

		previewFrame.src = currQueryParams.find(item => item[0] === 'url')
			? `./pages/${ currQueryParams.find(item => item[0] === 'url')[1] }`
			: ''

		// WAIT FOR IFRAME TO LOAD
		const previewFrameLoaded = await loadIFramePromise(previewFrame).catch(err => console.error(err))

		// EXTRACT BODY, :ROOT, AND * CSS VARIABLES
		previewStyles = getIFrameCustomCSS(previewFrame).map(style => {
			if (queryStyles.find(qStyle => qStyle[0] === style[0])) {
				style[1] = queryStyles.find(qStyle => qStyle[0] === style[0])[1]
			}
			return style
		})
	}

	// TODO: WRITE TO URL AS QUERY PARAMS WHEN EDITING ANY CSS VARIABLE VALUES
	function updateStyles(e, index) {
		const newStyles = previewStyles
		previewStyles[index][1] = e.target.value 
		previewStyles = newStyles

		if (queryString) {
			const url = window.location.href.slice(0, window.location.href.indexOf('?') >= 0
				? window.location.href.indexOf('?')
				: window.location.href.length)
			+ queryString

			window.history.replaceState(null, '', url)
		}
	}

	async function handleURLEnter(e) {
		e.preventDefault()
		
		const input = e.target.querySelector('select')
		const url = input.value

		let localPageFound = await fetch('./pages/'+url)

		localPageFound = localPageFound.status === 404 ? false : true

		console.log('localPageFound = ', localPageFound)

		if (!localPageFound) {
			input.value = ''
			return
		}

		const newQueryParams = [...currQueryParams]
		newQueryParams.push(['url', url])

		currQueryParams = newQueryParams

		iFrameInitialized = true
		await tick()

		window.history.replaceState(null, '', window.location.href +'?url='+ url)

		handleMount()		
	}
</script>

<main>
	<section class={`side-bar ${ isSidebarOpen ? 'open' : '' }`}>
		<h1>Site Theming Tool</h1>
		<button class='side-bar_toggle'
			on:click={() => isSidebarOpen = !isSidebarOpen}>
			{ !isSidebarOpen ? 'Open →' : '← Close' }
		</button>
		{#if previewStyles instanceof Array}
		<section class='control_group'>
			{#each previewStyles as style, j ('style-control_'+j)}
			<label>
				{ style[0] }
				<input type={
					style[0].includes('color')
						? 'color'
						: 'text'
				} on:input={e => updateStyles(e, j)} />
				{ style[1] }
			</label>
			{/each}
		</section>
		{/if}
	</section>

	<!-- iFrame of other page, or selection of page to view. -->
	{#if iFrameInitialized}
	<iframe title='page-preview' bind:this={ previewFrame } width='100%' height='100%' allowfullscreen>
		<p>Sorry, your iframe isn't loading!</p>
	</iframe>
	{:else}
	<form class='page-picker' action='' method='post' on:submit={handleURLEnter}>
		<label>Enter a filename from within the local <code>/static/pages/</code> directory.
			<select name='url'>
				<option value=''>Pick a page</option>
				{#each availablePages as page, i}
				<option value={ page }>{ page }</option>
				{/each}
			</select>
		</label>
		<button type='submit'>Submit</button>
	</form>
	{/if}
</main>

<style>
	:global(body) {
		padding: 0;
		margin: 0;
	}

	main {
		--h-color: #6060a3;
		--body-color: black;
		--bg: white;

		text-align: center;
		padding: 0;
		margin: 0;
		background: var(--bg);
		color: var(--body-color);
		height: 100vh;
		width: 100vw;
		overflow: hidden;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	h1 {
		color: var(--h-color);
		text-transform: uppercase;
		font-size: 2em;
		font-weight: 100;
	}

	section {
		margin: 2em 0;
	}

	.side-bar {
		position: fixed;
		top: 0;
		right: 100%;
		bottom: 0;
		width: 30vw;
		min-width: 300px;
		max-width: 100%;
		height: 100%;
		box-sizing: border-box;
		padding: 10vh 3em;
		margin: 0;
		background: white;
		display: grid;
		grid-template-rows: auto 1fr;

		transition: transform .12s ease-in-out;
	}

	.control_group {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		align-items: flex-start;
		box-sizing: border-box;
		padding: 5vh 0;
		margin: 0;
		justify-self: stretch;
	}


	.side-bar.open {
		transform: translate(100%);
		box-shadow: .2vw 0 .8vw rgba(0,0,0,0.2), 1vw 0 1.6vw rgba(0,0,0,.08);
	}

	.side-bar_toggle {
		position: fixed;
		left: 2vw;
		top: 5vh;
		background: #f0a0f3;
		border: none;
		border-radius: 2em;
		padding: .4em 1.5em;
		box-shadow: 0 .2vh .5vh rgba(0,0,0,0.2), 0 1.1vh 1.5vh rgba(0,0,0,0.08);
		z-index: 3;
	}


	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>