(function(root){
 function aggregate(data){const result={rows:data.length/5,qty:0,revenue:0,products:Array(8).fill(0),categories:Array(8).fill(0),hours:Array(24).fill(0)};for(let i=0;i<data.length;i+=5){const product=data[i],category=data[i+1],hour=data[i+2],qty=data[i+3],total=data[i+4];result.qty+=qty;result.revenue+=total;while(result.products.length<=product)result.products.push(0);result.products[product]+=qty;result.categories[category]+=total;result.hours[hour]+=total;}return result;}
 function merge(parts){const result={rows:0,qty:0,revenue:0,products:Array(8).fill(0),categories:Array(8).fill(0),hours:Array(24).fill(0)};for(const part of parts){for(const k of ['rows','qty','revenue'])result[k]+=part[k];for(const k of ['products','categories','hours'])part[k].forEach((v,i)=>{while(result[k].length<=i)result[k].push(0);result[k][i]+=v;});}return result;}
 root.CoffeeStats={aggregate,merge};if(typeof module!=='undefined')module.exports=root.CoffeeStats;
})(globalThis);
