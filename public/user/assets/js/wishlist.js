document.querySelectorAll('.add-to-cart-btn').forEach(button => {
  button.addEventListener('click', async (event) => {
    const productId = event.target.closest('.wishlist-item').dataset.productId;
    try {
      const response = await fetch('/add-to-cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId }),
      });

      if (response.ok) {
        // Remove the item from the DOM
        event.target.closest('.wishlist-item').remove();
      } else {
        console.error('Failed to add to cart');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  });
});

document.querySelectorAll('.deleteButton').forEach(deleteButton => {
  deleteButton.addEventListener('click' , async (e) => {
    const wishlistItem = e.target.closest('.wishlist-item')
    const productId = wishlistItem.dataset.productId
    try {
      const response = await fetch("/delete-wishlist-item", {
        method: "post",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId }),
      });
      if (!response) {
        throw new Error("somthing went wrong while deleting wishlist item");
      }
      const data = await response.json();
      if (data.redirect) {
    wishlistItem.remove()
      }
    } catch (error) {
      console.log(error);
    }
  })
})

async function searchInput() {
  console.log(document.getElementById("search-input").value);
  const search_text = document.getElementById("search-input").value;

  if (!search_text) {
    document.getElementById("search-suggestions").style.display = "none";
    return;
  }
  const response = await fetch("/search-wishlistProducts", {
    method: "post",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ search_text }),
  });
  if (!response.ok) {
    return new Error("something went wrong while product searching");
  }

  const data = await response.json();
  const suggestions = document.getElementById("search-suggestions");
  suggestions.innerHTML = "";

  if (data.searchedProducts && data.searchedProducts.length > 0) {
    data.searchedProducts.forEach((item) => {
      const product = item.products;
      const div = document.createElement("div");
      div.classList.add("suggestions-item");
      div.innerHTML = `<div class="product-container">
          <img src="../../user/assets/images/productImages/${product.image[0]}" style="height : 50px; width:50px;" alt="${product.productName}">
            <div>
              <div>${product.productName}</div>
              <small>${product.selectedCategory}</small>
            </div>
            </div>`;
      div.addEventListener("click", async () => showProduct(product));
      suggestions.appendChild(div);
    });
    suggestions.style.display = "block";
  }

  function showProduct(product) {
    window.location.href = `/product-list/${product._id}`;
  }
}
document.addEventListener("click", function (event) {
  const suggestions = document.getElementById("search-suggestions");
  const search_input = document.getElementById("search-input");

  if (
    !suggestions.contains(event.target) &&
    !search_input.contains(event.target)
  ) {
    suggestions.style.display = "none";
  }
});

document
  .getElementById("search-input")
  .addEventListener("click", function (event) {
    const suggestions = document.getElementById("search-suggestions");
    if (suggestions.children.length > 0) {
      suggestions.style.display = "block";
    }
  });
