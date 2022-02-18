
function test(){
	throw new Error('test error');
}


function preTest()
{
	try{
		test();
	}
	catch(e)
	{
		console.log(e.Error);
	}
	console.log('after catch');
}


console.log(preTest());