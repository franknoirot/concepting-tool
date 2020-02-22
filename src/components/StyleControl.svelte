<script>
    export let style = ['placeholder','undefined'] // default vals

</script>

<label class='control'>
    <!-- remove the '--' from CSS var name and use spaces instead of dashes -->
    <span class='label'>{ style[0].slice(2, style[0].length).replace(/-/gi, ' ') }</span>
    <input type={
            style[0].includes('color')
                ? 'color'
                : 'text'
        } 
        value={ style[1] } 
        on:input />
    <!-- using on:input with no callback does event forwarding to parent component -->
    <span class='value' >{ style[1] }</span>
</label>

<style>
    .control {
		margin: 1em 0;
		text-align: left;
	}

	.control:first-child {
		margin-block-start: 0;
	}
	.control:last-child {
		margin-block-end: 0;
	}
	
	.control .label {
		display: block;
		text-align: left;
		text-transform: uppercase;
		color: #444;
	}

    .control .value {
		align-self: center;
		display: block;
    }
</style>
