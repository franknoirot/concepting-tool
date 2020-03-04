<script context='module'>
	// scripte context='module' is Svelte-specific, tells this script to only run
	// once for any instance of a component. Since there's only one App component
	// I think this could live with all the other script, but I like these two
	// tasks being separate
	let availablePages = ['landing-page', 'blog-template'] // TODO: make this dynamically check the pages/ directory
	let currQueryParams = Array.from((new URL(document.location)).searchParams.entries()) // Create an array from url query params
</script>

<script>
	import { onMount, tick, afterUpdate } from 'svelte' // Svelte lifecycle methods
	import { loadIFramePromise, getIFrameCustomCSS } from './utils/iframeStyling' // Custom iFrame + CSS logic
	import StyleControl from './components/StyleControl.svelte' // Input Component that changes type based on CSS Variable name

	let iFrameInitialized = currQueryParams.find(item => item[0] === 'url')
	let previewFrame, previewStyles
	let isFirstCall = true
	let paramStyles = '', originalStyles = []
	let isSidebarOpen = true
	let queryString = ''

	// queryStyles gets updated any time currQueryParams changes
	// "--" identifies query params that are style-related, just like in CSS
	$: queryStyles = currQueryParams.filter(param => param[0].startsWith('--')) 

	// "$: " syntax in Svelte make this run any time any of variables referenced within change
	// iFrame.contentDocument check ensures this only runs after the iFrame is done loading
	// previewStyles ensure this only runs after a change to the default styles has been made.
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
		if (!currQueryParams.find(item => item[0] === 'url')) return // if there's no "url" query param don't run

		// set iFrame src to local page within "pages" directory plus url query param value
		previewFrame.src = currQueryParams.find(item => item[0] === 'url')
			? `./pages/${ currQueryParams.find(item => item[0] === 'url')[1] }`
			: ''

		// wait for iFrame to load
		const previewFrameLoaded = await loadIFramePromise(previewFrame).catch(err => console.error(err))

		// extract body, :root, and * css rules from the iFrame page and fill a previewStyles array with them
		previewStyles = getIFrameCustomCSS(previewFrame).map(style => {
			if (queryStyles.find(qStyle => qStyle[0] === style[0])) {
				style[1] = queryStyles.find(qStyle => qStyle[0] === style[0])[1]
			}
			return style
		})

		// set originalStyles on first run to check against later
		if (isFirstCall) {
			isFirstCall = false
			originalStyles = [...previewStyles.map(style => [...style])]
		}

	}

	function updateStyles(e, index) {
		// Svelte's variable invalidation is clunky with arrays and objects.
		// Need to copy array, change the value you want, then overwrite the original array
		const newStyles = previewStyles
		previewStyles[index][1] = e.target.value 
		previewStyles = newStyles 

		buildQueryString() // Line 86

		// don't refresh window if nothing changed
		if (queryString) {
			// replace existing query string in url or append to url if none exists
			const url = window.location.href.slice(0, window.location.href.indexOf('?') >= 0
				? window.location.href.indexOf('?')
				: window.location.href.length)
			+ queryString

			// update browser history 
			// TODO: make this less incessant; you can have a lot of browser history pretty quickly
			window.history.replaceState(null, '', url)
		}
	}

	function buildQueryString() {
		// only run if there are query params and styles to check
		if (currQueryParams && previewStyles) {

		// extract only the styles that have been changed from their original values
		const filteredStyles = previewStyles.filter((style, i) => style[1] !== originalStyles[i][1])

		// build query string from page name as "url" param + any style rules that changed
		queryString = '?'+(`${(currQueryParams.find(param => param[0] === 'url')) 
			? 'url=' + currQueryParams.find(param => param[0] === 'url')[1] 
			: ''}${ (filteredStyles) 
			? ((filteredStyles.length > 1) 
				? '&' + filteredStyles.map(style => (encodeURIComponent(style[0])+'='+encodeURIComponent(style[1]))).join('&')
				: '&' + encodeURIComponent(filteredStyles[0][0]) + '=' + encodeURIComponent(filteredStyles[0][1])) // did this wonky single case because I didn't want it to have an "&" after it
			: '' }`)
		}
	}

	async function handleURLEnter(e) {
		// called on input from page-picker form
		e.preventDefault()
		
		const input = e.target.querySelector('select')
		const url = input.value

		let localPageFound = await fetch('./pages/'+url)

		localPageFound = localPageFound.status === 404 ? false : true

		if (!localPageFound) {
			input.value = ''
			return
		}

		// updating currQueryParams array the clunky Svelte way
		const newQueryParams = [...currQueryParams]
		newQueryParams.push(['url', url])
		currQueryParams = newQueryParams

		iFrameInitialized = true
		await tick() // tick lets Svelte pause while all the iFrame-loading-related code above runs

		window.history.replaceState(null, '', window.location.href +'?url='+ url)

		// safe to call handleMount now since we know we've waited for the iFrame to initiliaze and load it's src
		handleMount()
	}
</script>

<main>
	<!-- Sidebar, populated with controls if viewing an iFrame -->
	<section class={`side-bar ${ isSidebarOpen ? 'open' : '' }`}>
		<h1>Site Theming Tool</h1>
		{#if previewStyles instanceof Array}
		<section class='control_group'>
			{#each previewStyles as style, j ('style-control_'+j)}
<<<<<<< HEAD
			<label class='control'>
				<span class='label'>{ style[0].slice(2, style[0].length).replace('-', ' ') }</span>
				<input type={
					style[0].includes('color')
						? 'color'
						: 'text'
				} value={ style[1] } 
				on:input={e => updateStyles(e, j)} />
				{#if style[0].includes('color')}
				<span class='value' >{ style[1] }</span>
				{/if}
			</label>
=======
			<StyleControl style={style} on:input={e => updateStyles(e, j)} />
>>>>>>> 635a3a0219fa2fba53f6886fd733a6c2b079acad
			{/each}
		</section>
		{/if}
	</section>
	<button class={`side-bar_toggle ${ isSidebarOpen ? 'open' : '' }`}
		on:click={() => isSidebarOpen = !isSidebarOpen}>
		<svg viewBox='0 0 10 5'>
			<path d='M 1 2.5 l 8 0 M 7 1 l 2 1.5 l -2 1.5' />
		</svg>
		<span>{ !isSidebarOpen ? 'Open' : 'Close' } Tool Bar</span>
	</button>

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
		margin: 0 0 1em 0;
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
		padding: 5vh 3em;
<<<<<<< HEAD
		padding-block-end: calc(10vh + 2em);
=======
		padding-block-end: 15vh;
>>>>>>> 635a3a0219fa2fba53f6886fd733a6c2b079acad
		margin: 0;
		background: rgba(255,255,255,.9);
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
		padding-block-end: 10vh;
		margin: 0;
		justify-self: stretch;
		overflow-y: scroll;
	}


	.side-bar.open,
	.side-bar:focus-within {
		transform: translate(100%);
		box-shadow: .2vw 0 .8vw rgba(0,0,0,0.2), 1vw 0 1.6vw rgba(0,0,0,.08);
	}

	.side-bar_toggle {
		position: fixed;
		left: 2vw;
		bottom: 3vh;
		z-index: 3;
		display: flex;
		align-items: center;
		background: none;
		border: none;
	}

	.side-bar_toggle svg {
		width: 2em;
		height: 1em;
		background: #f0a0f3;
		border: none;
		border-radius: 2em;
		padding: 1em;
		box-shadow: 0 .2vh .5vh rgba(0,0,0,0.2), 0 1.1vh 1.5vh rgba(0,0,0,0.08);
		transition: all .12s ease-in-out;
	}

	.side-bar_toggle path {
		stroke: white;
		stroke-linecap: round;
		fill: transparent;
		transform-origin: 50% 50%;
		transform-style: preserve-3d;
		transform: rotate(0deg);
		transition: all .12s ease-in-out;
	}

	.side-bar_toggle span {
		display: inline-block;
		margin-inline-start: -2em;
		transform-origin: 0 50%;
		opacity: 0;
		transform: rotate(15deg);
		transition: opacity .12s ease-in-out, transform .12s .04s ease-in-out;
		background: hsla(323deg, 68%, 74%, .9);
		padding: .8em 3em;
		border-radius: 2em;
		position: relative;
		z-index: -1;
		color: white;
	}

	.side-bar_toggle:hover span {
		transform: rotate(0deg);
		opacity: 1;
	}

	.side-bar_toggle:focus svg {
		background: #d080d3;
	}

	.side-bar_toggle.open path {
		transform: rotateY(.5turn);
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>