<script context='module'>
	const currQueryParams = Array.from((new URL(document.location)).searchParams.entries())
</script>

<script>
	let paramStyles = ''

	currQueryParams.forEach(param => {
		paramStyles += `--${ param[0] }: #${ param[1] }; `
	})
</script>

<main style={ paramStyles }>
	<h1>Query Param Test</h1>
	<p>The URL params include the following:</p>
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