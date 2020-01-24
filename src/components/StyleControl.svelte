<script>
    export const style = [['placeholder'],['undefined']]

</script>

<label>
    <span class='label'>{ style[0] }</span>
    {#if style.contains('color')}
    <input type='color' value={style[1]} on:change />
    {:else}
    <input type='text' value={style[1]} on:change />
    {/if}
    <span class='value'>{ style[1] }</span>
</label>

<style>
    
</style>
