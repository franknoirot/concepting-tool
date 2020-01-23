<script context='module'>
	let currQueryParams = Array.from((new URL(document.location)).searchParams.entries())
</script>

<script>
	import { onMount, tick } from 'svelte'
	import { loadIFramePromise, getIFrameCustomCSS } from './utils/iframeStyling'
	let iFrameInitialized = currQueryParams.find(item => item[0] === 'url')
	let previewFrame, previewStyles
	let paramStyles = ''

	$: queryStyles = currQueryParams.filter(param => param[0].startsWith('--'))

	let queryString = ''
	$: if (currQueryParams && previewStyles) {
		queryString = '?'+(`${(currQueryParams.find(param => param[0] === 'url')) ? 'url='+currQueryParams.find(param => param[0] === 'url')[1] : ''}${ (previewStyles) ? '&'+previewStyles.map(style => (encodeURIComponent(style[0])+'='+encodeURIComponent(style[1]))).join('&') : '' }`)
		console.log('queryString = ', queryString)
	}


	$: if (previewFrame && previewFrame.contentDocument && previewStyles) {
		console.log('document =', previewFrame.contentDocument.documentElement.innerHTML)

		const hasInjectedStyles = (previewFrame.contentDocument.documentElement.innerHTML).includes('style id="injected"')

		console.log(`has injected styles = `, hasInjectedStyles )
		if (hasInjectedStyles) {
			console.log('replacement test = ', (previewFrame.contentDocument.documentElement.innerHTML).search(/<style id="injected">(.|\t|\r|\n)*<\/head>/))
		}

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
		console.log('queryStyles = ', queryStyles)
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
		console.log('previewStyles = ', previewStyles)

		// CREATE UI CONTROLS FOR EACH TOP LEVEL VARIABLE BASED ON TYPE


		

		// TODO: LOAD QUERY PARAMS AND ASSIGN TO IFRAME PAGE BY CREATING A NEW CSS FILE AND INSERTING AT END OF HEAD TAG

	}

	// TODO: WRITE TO URL AS QUERY PARAMS WHEN EDITING ANY CSS VARIABLE VALUES
	function updateStyles(e, index) {
		console.log('e & index = ', e, index)
		const newStyles = previewStyles
		previewStyles[index][1] = e.target.value 
		previewStyles = newStyles

		if (queryString) {
			const url = window.origin + '/' + queryString

			window.history.replaceState(null, '', url)
		}
	}

	async function handleURLEnter(e) {
		e.preventDefault()
		
		const input = e.target.querySelector('input')
		const url = input.value

		let localPageFound = await fetch('/pages/'+url)

		localPageFound = localPageFound.status === 404 ? false : true

		console.log('localPageFound = ', localPageFound)

		if (!localPageFound) {
			input.value = ''
			return
		}

		const newQueryParams = [...currQueryParams]
		newQueryParams.push(['url', url])

		currQueryParams = newQueryParams

		console.log('currQueryParams = ', currQueryParams)

		iFrameInitialized = true
		await tick()

		window.history.replaceState(null, '', window.location.origin +'/?url='+ url)

		handleMount()		
	}
</script>

<main>
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
	{#if previewStyles instanceof Array}
	<section>
		{#each previewStyles as style, j ('style-control_'+j)}
		<label>
			{ style[0] }
			<input type='color' on:change={ (e) => updateStyles(e, j) } />
			{ style[1] }
		</label>
		{/each}
	</section>
	{/if}
	{#if iFrameInitialized}
	<iframe title='page-preview' bind:this={ previewFrame } width='80%' height='600' allowfullscreen>
		<p>Sorry, your iframe isn't loading!</p>
	</iframe>
	{:else}
	<form action='' method='post' on:submit={handleURLEnter}>
		<label>Enter a filename from within the local <code>/static/pages/</code> directory.
			<input type='text' name='url' required />
		</label>
		<button type='submit'>Submit</button>
	</form>
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