importScripts('stats-kernel.js?v=collections-wishes-v47');
onmessage=({data})=>{if(data.ping){postMessage({ready:true});return;}try{postMessage({result:CoffeeStats.aggregate(new Int32Array(data.buffer))});}catch(error){postMessage({error:error.message});}};
