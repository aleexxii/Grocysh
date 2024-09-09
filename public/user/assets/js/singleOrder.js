async function statusUpdate(selectElement){
    const productId = selectElement.getAttribute('data-product-id')
    const mainProductId = selectElement.getAttribute('data-main-productId')
    const productStatus = selectElement.value
    const userId = document.getElementById('userId').value
    const paymentMethod = document.getElementById('paymentMethod').value
    const totalPrice = document.getElementById('totalPrice').value
    const quantity = document.getElementById('quantity').value

    try {
        const response = await fetch('./single-order',{
        method : 'post',
        headers : {
            "Content-Type" : "application/json"
        },
        body : JSON.stringify({ productStatus, productId, userId, paymentMethod, totalPrice , mainProductId, quantity })
    })
    if(!response){
        throw new Error('something went wrong')
    }
    const data = await response.json()
    if(data.message){
        console.log('updated');
    }
    } catch (error) {
        console.log(error);
    }
  
}