<script>
    export const style = [['placeholder'],['undefined']]

</script>

<label>
    { style[0] }
    {#if style.contains('color')}
    <input type='color' on:change />
    {:else}
    <input type='text' on:change />
    {/if}
    { style[1] }
</label>

<style>

</style>
