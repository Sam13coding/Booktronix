    // Global Variables
    let currentUser = null;
    let currentBook = null;
    let cart = [];
    let wishlist = [];
    let reviews = {};
    let orders = [];
    let addresses = [];
    let selectedGenre = 'all';
    let startIndex = 0;
    let maxResults = 10;
    
    // Initialize App
    document.addEventListener('DOMContentLoaded', function() {
      console.log('DOMContentLoaded fired, initializing app');
      // Initialize Swiper
      const swiper = new Swiper('.featuredSwiper', {
        slidesPerView: 'auto',
        spaceBetween: 30,
        pagination: {
          el: '.swiper-pagination',
          clickable: true,
        },
        breakpoints: {
          640: {
            slidesPerView: 2,
          },
          768: {
            slidesPerView: 3,
          },
          1024: {
            slidesPerView: 4,
          },
        }
      });
      
      // Load user data from localStorage
      loadUserData();
      
      // Load cart data from localStorage
      loadCartData();
      
      // Load wishlist data from localStorage
      loadWishlistData();
      
      // Load reviews data from localStorage
      loadReviewsData();
      
      // Load orders data from localStorage
      loadOrdersData();
      
      // Load addresses data from localStorage
      loadAddressesData();
      
      // Fetch featured books
      fetchFeaturedBooks();
      
      // Fetch books for home page
      fetchBooks(selectedGenre);
      
      // Setup event listeners
      try {
        setupEventListeners();
      } catch (e) {
        console.error('Error during setupEventListeners:', e);
      }
    });
    
    // Load User Data from localStorage
    function loadUserData() {
      const userData = localStorage.getItem('currentUser');
      if (userData) {
        currentUser = JSON.parse(userData);
        updateUserUI();
      }
    }
    
    // Update UI based on user login status
    function updateUserUI() {
      const cartCount = document.getElementById('cartCount');
      const userDropdown = document.getElementById('userDropdown');
      
      if (currentUser) {
        // Update profile information
        document.getElementById('profileName').textContent = `${currentUser.firstName} ${currentUser.lastName}`;
        document.getElementById('profileEmail').textContent = currentUser.email;
        document.getElementById('profileFirstName').value = currentUser.firstName;
        document.getElementById('profileLastName').value = currentUser.lastName;
        document.getElementById('profileEmailInput').value = currentUser.email;
        document.getElementById('profilePhone').value = currentUser.phone || '';
        document.getElementById('profileDob').value = currentUser.dob || '';
        
        // Update dropdown menu
        userDropdown.innerHTML = `
          <i class="fas fa-user-circle me-1"></i> ${currentUser.firstName}
        `;
        
        // Update dropdown items
        const dropdownMenu = userDropdown.nextElementSibling;
        dropdownMenu.innerHTML = `
          <li><a class="dropdown-item" href="javascript:void(0)" onclick="navigateTo('profilePage')">My Profile</a></li>
          <li><a class="dropdown-item" href="javascript:void(0)" onclick="logout()">Logout</a></li>
        `;
      }
    }
    
    // Load Cart Data from localStorage
    function loadCartData() {
      const cartData = localStorage.getItem('cart');
      if (cartData) {
        cart = JSON.parse(cartData);
        updateCartUI();
      }
    }
    
    // Update Cart UI
    function updateCartUI() {
      const cartCount = document.getElementById('cartCount');
      cartCount.textContent = cart.reduce((total, item) => total + item.quantity, 0);
      
      // Update cart page if visible
      if (document.getElementById('cartPage').style.display !== 'none') {
        renderCart();
      }
      
      // Update checkout page if visible
      if (document.getElementById('checkoutPage').style.display !== 'none') {
        renderOrderSummary();
      }
    }
    
    // Render Cart
    function renderCart() {
      const cartItemsContainer = document.getElementById('cartItemsContainer');
      const cartItemCount = document.getElementById('cartItemCount');
      const cartSubtotal = document.getElementById('cartSubtotal');
      const taxAmount = document.getElementById('taxAmount');
      const cartTotal = document.getElementById('cartTotal');
      const checkoutBtn = document.getElementById('checkoutBtn');
      
      // Clear cart container
      cartItemsContainer.innerHTML = '';
      
      if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
          <div class="text-center py-5">
            <i class="fas fa-shopping-cart fa-3x text-muted mb-3"></i>
            <h4>Your cart is empty</h4>
            <p class="text-muted">Add some books to your cart and they will appear here.</p>
            <button class="btn btn-primary mt-3" onclick="navigateTo('homePage')">
              Continue Shopping
            </button>
          </div>
        `;
        
        cartItemCount.textContent = '0';
        cartSubtotal.textContent = '$0.00';
        taxAmount.textContent = '$0.00';
        cartTotal.textContent = '$0.00';
        checkoutBtn.disabled = true;
        
        return;
      }
      
      // Enable checkout button
      checkoutBtn.disabled = false;
      
      // Render cart items
      let subtotal = 0;
      
      cart.forEach((item, index) => {
        const itemTotal = (item.price * item.quantity).toFixed(2);
        subtotal += parseFloat(itemTotal);
        
        cartItemsContainer.innerHTML += `
          <div class="cart-item">
            <img src="${item.thumbnail}" alt="${item.title}" class="cart-item-img">
            <div class="cart-item-info">
              <div class="d-flex justify-content-between align-items-start">
                <div>
                  <h3 class="cart-item-title">${item.title}</h3>
                  <p class="cart-item-author">${item.authors}</p>
                  <p class="cart-item-price">$${item.price.toFixed(2)}</p>
                </div>
                <button class="btn btn-sm text-danger" onclick="removeFromCart(${index})"><i class="fas fa-trash"></i></button>
              </div>
              <div class="d-flex justify-content-between align-items-end">
                <div class="cart-quantity">
                  <button class="minus-btn" onclick="decreaseCartQuantity(${index})"><i class="fas fa-minus"></i></button>
                  <input type="text" value="${item.quantity}" readonly>
                  <button class="plus-btn" onclick="increaseCartQuantity(${index})"><i class="fas fa-plus"></i></button>
                </div>
                <p class="mb-0 fw-bold">$${itemTotal}</p>
              </div>
            </div>
          </div>
        `;
      });
      
      // Update summary
      const tax = subtotal * 0.1;
      const total = subtotal + tax + 4.99;
      
      cartItemCount.textContent = cart.reduce((total, item) => total + item.quantity, 0);
      cartSubtotal.textContent = `$${subtotal.toFixed(2)}`;
      taxAmount.textContent = `$${tax.toFixed(2)}`;
      cartTotal.textContent = `$${total.toFixed(2)}`;
    }
    
    // Render Order Summary
    function renderOrderSummary() {
      const orderSummaryItems = document.getElementById('orderSummaryItems');
      const orderItemCount = document.getElementById('orderItemCount');
      const orderSubtotal = document.getElementById('orderSubtotal');
      const orderTaxAmount = document.getElementById('orderTaxAmount');
      const orderTotal = document.getElementById('orderTotal');
      
      // Clear order summary container
      orderSummaryItems.innerHTML = '';
      
      if (cart.length === 0) {
        orderSummaryItems.innerHTML = `
          <div class="text-center py-2">
            <p class="text-muted">Your cart is empty</p>
          </div>
        `;
        
        orderItemCount.textContent = '0';
        orderSubtotal.textContent = '$0.00';
        orderTaxAmount.textContent = '$0.00';
        orderTotal.textContent = '$0.00';
        
        return;
      }
      
      // Render order summary items
      let subtotal = 0;
      
      cart.forEach(item => {
        const itemTotal = (item.price * item.quantity).toFixed(2);
        subtotal += parseFloat(itemTotal);
        
        orderSummaryItems.innerHTML += `
          <div class="d-flex mb-2">
            <img src="${item.thumbnail}" alt="${item.title}" width="50" height="70" class="me-2" style="object-fit: cover;">
            <div>
              <p class="mb-0 small fw-semibold">${item.title}</p>
              <p class="mb-0 small text-muted">Qty: ${item.quantity}</p>
              <p class="mb-0 small">$${itemTotal}</p>
            </div>
          </div>
        `;
      });
      
      // Update summary
      const tax = subtotal * 0.1;
      const total = subtotal + tax + 4.99;
      
      orderItemCount.textContent = cart.reduce((total, item) => total + item.quantity, 0);
      orderSubtotal.textContent = `$${subtotal.toFixed(2)}`;
      orderTaxAmount.textContent = `$${tax.toFixed(2)}`;
      orderTotal.textContent = `$${total.toFixed(2)}`;
    }
    
    // Load Wishlist Data from localStorage
    function loadWishlistData() {
      const wishlistData = localStorage.getItem('wishlist');
      if (wishlistData) {
        wishlist = JSON.parse(wishlistData);
      }
    }
    
    // Render Wishlist
    function renderWishlist() {
      const wishlistContainer = document.getElementById('wishlistContainer');
      
      // Clear wishlist container
      wishlistContainer.innerHTML = '';
      
      if (wishlist.length === 0) {
        wishlistContainer.innerHTML = `
          <div class="col-12 text-center py-5">
            <i class="far fa-heart fa-3x text-muted mb-3"></i>
            <h4>Your wishlist is empty</h4>
            <p class="text-muted">Add some books to your wishlist and they will appear here.</p>
            <button class="btn btn-primary mt-3" onclick="navigateTo('homePage')">
              Browse Books
            </button>
          </div>
        `;
        
        return;
      }
      
      // Render wishlist items
      wishlist.forEach((item, index) => {
        wishlistContainer.innerHTML += `
          <div class="col-md-4 col-sm-6">
            <div class="book-card shadow-soft shadow-hover">
              <div class="book-cover">
                <img src="${item.thumbnail}" alt="${item.title}">
              </div>
              <div class="book-info">
                <h3 class="book-title">${item.title}</h3>
                <p class="book-author">${item.authors}</p>
                <p class="book-price">$${item.price.toFixed(2)}</p>
                <div class="book-rating">
                  ${generateRatingStars(item.rating)}
                </div>
                <div class="book-actions">
                  <button class="btn btn-sm btn-primary flex-grow-1" onclick="addToCartFromWishlist(${index})">Add to Cart</button>
                  <button class="btn btn-sm btn-outline-danger" onclick="removeFromWishlist(${index})"><i class="fas fa-trash"></i></button>
                </div>
              </div>
            </div>
          </div>
        `;
      });
    }
    
    // Load Reviews Data from localStorage
    function loadReviewsData() {
      const reviewsData = localStorage.getItem('reviews');
      if (reviewsData) {
        reviews = JSON.parse(reviewsData);
      }
    }
    
    // Render Book Reviews
    function renderBookReviews(bookId) {
      const reviewsList = document.getElementById('reviewsList');
      const reviewsCount = document.getElementById('reviewsCount');
      const averageRating = document.getElementById('averageRating');
      const averageRatingStars = document.getElementById('averageRatingStars');
      
      // Clear reviews container
      reviewsList.innerHTML = '';
      
      // Get book reviews
      const bookReviews = reviews[bookId] || [];
      
      // Update reviews count
      reviewsCount.textContent = bookReviews.length;
      
      if (bookReviews.length === 0) {
        reviewsList.innerHTML = `
          <div class="text-center py-3">
            <p class="text-muted">No reviews yet. Be the first to review this book!</p>
          </div>
        `;
        
        averageRating.textContent = '0';
        averageRatingStars.innerHTML = generateRatingStars(0);
        
        return;
      }
      
      // Calculate average rating
      const avgRating = bookReviews.reduce((sum, review) => sum + review.rating, 0) / bookReviews.length;
      averageRating.textContent = avgRating.toFixed(1);
      averageRatingStars.innerHTML = generateRatingStars(avgRating);
      
      // Render reviews
      bookReviews.forEach(review => {
        reviewsList.innerHTML += `
          <div class="review-item">
            <div class="review-header">
              <span class="reviewer-name">${review.username}</span>
              <span class="review-date">${new Date(review.date).toLocaleDateString()}</span>
            </div>
            <div class="review-rating">
              ${generateRatingStars(review.rating)}
            </div>
            <p class="review-text">${review.text}</p>
          </div>
        `;
      });
    }
    
    // Load Orders Data from localStorage
    function loadOrdersData() {
      const ordersData = localStorage.getItem('orders');
      if (ordersData) {
        orders = JSON.parse(ordersData);
      }
    }
    
    // Render Order History
    function renderOrderHistory() {
      const orderHistoryTable = document.getElementById('orderHistoryTable');
      
      // Clear order history container
      orderHistoryTable.innerHTML = '';
      
      if (orders.length === 0) {
        orderHistoryTable.innerHTML = `
          <tr>
            <td colspan="6" class="text-center py-4">
              <p class="text-muted mb-2">You haven't placed any orders yet.</p>
              <button class="btn btn-sm btn-primary" onclick="navigateTo('homePage')">
                Browse Books
              </button>
            </td>
          </tr>
        `;
        
        return;
      }
      
      // Render orders
      orders.forEach(order => {
        orderHistoryTable.innerHTML += `
          <tr>
            <td>${order.orderNumber}</td>
            <td>${new Date(order.date).toLocaleDateString()}</td>
            <td>${order.items.reduce((total, item) => total + item.quantity, 0)} items</td>
            <td>$${order.total.toFixed(2)}</td>
            <td><span class="badge bg-${getStatusBadgeColor(order.status)}">${order.status}</span></td>
            <td><button class="btn btn-sm btn-outline-primary" onclick="viewOrderDetails('${order.orderNumber}')">Details</button></td>
          </tr>
        `;
      });
    }
    
    // Get Status Badge Color
    function getStatusBadgeColor(status) {
      switch(status) {
        case 'Delivered':
          return 'success';
        case 'Shipped':
          return 'info';
        case 'Processing':
          return 'warning';
        case 'Cancelled':
          return 'secondary';
        default:
          return 'primary';
      }
    }
    
    // Load Addresses Data from localStorage
    function loadAddressesData() {
      const addressesData = localStorage.getItem('addresses');
      if (addressesData) {
        addresses = JSON.parse(addressesData);
      }
    }
    
    // Render Addresses
    function renderAddresses() {
      const addressesContainer = document.getElementById('addressesContainer');
      
      // Clear addresses container
      addressesContainer.innerHTML = '';
      
      if (addresses.length === 0) {
        addressesContainer.innerHTML = `
          <div class="col-12 text-center py-4">
            <p class="text-muted">You haven't added any addresses yet.</p>
          </div>
        `;
        
        return;
      }
      
      // Render addresses
      addresses.forEach((address, index) => {
        addressesContainer.innerHTML += `
          <div class="col-md-6">
            <div class="card">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-start mb-2">
                  <h5 class="card-title mb-0">${address.addressName}</h5>
                  ${address.isDefault ? '<span class="badge bg-primary">Default</span>' : ''}
                </div>
                <address class="mb-3">
                  ${address.fullName}<br>
                  ${address.addressLine1}<br>
                  ${address.addressLine2 ? address.addressLine2 + '<br>' : ''}
                  ${address.city}, ${address.state} ${address.zip}<br>
                  ${address.country}<br>
                  <abbr title="Phone">P:</abbr> ${address.phone}
                </address>
                <div class="btn-group">
                  <button class="btn btn-sm btn-outline-primary" onclick="editAddress(${index})">Edit</button>
                  <button class="btn btn-sm btn-outline-danger" onclick="deleteAddress(${index})">Delete</button>
                  ${!address.isDefault ? `<button class="btn btn-sm btn-outline-secondary" onclick="setDefaultAddress(${index})">Set as Default</button>` : ''}
                </div>
              </div>
            </div>
          </div>
        `;
      });
    }
    
    // Setup Event Listeners
    function setupEventListeners() {
      const bind = (id, event, handler) => {
        const el = document.getElementById(id);
        if (!el) {
          console.warn(`setupEventListeners: element #${id} not found`);
          return;
        }
        el.addEventListener(event, handler);
      };

      // Search
      bind('homeSearchInput', 'keypress', function(e) {
        if (e.key === 'Enter') {
          const query = e.target.value.trim();
          if (query) {
            navigateTo('searchPage');
            const adv = document.getElementById('advancedSearchInput');
            if (adv) adv.value = query;
            searchBooks(query);
          }
        }
      });

      bind('advancedSearchInput', 'keypress', function(e) {
        if (e.key === 'Enter') {
          const query = e.target.value.trim();
          if (query) {
            searchBooks(query);
          }
        }
      });

      // Genre tabs
      document.querySelectorAll('.genre-tab').forEach(tab => {
        tab.addEventListener('click', function() {
          const genre = this.dataset.genre;
          selectedGenre = genre;
          
          // Update genre tabs
          document.querySelectorAll('.genre-tab').forEach(t => {
            t.classList.remove('active');
          });
          this.classList.add('active');
          
          // Update category heading
          const categoryHeading = document.getElementById('categoryHeading');
          if (categoryHeading) categoryHeading.textContent = this.textContent;
          
          // Fetch books for the selected genre
          fetchBooks(genre);
        });
      });

      // Load more button
      bind('loadMoreBtn', 'click', function() {
        startIndex += maxResults;
        fetchBooks(selectedGenre, true);
      });

      // Advanced search filters
      bind('applyFiltersBtn', 'click', function() {
        const query = document.getElementById('advancedSearchInput')?.value.trim() || '';
        searchBooks(query);
      });

      // Results per page selection
      bind('resultsPerPage', 'change', function() {
        maxResults = parseInt(this.value);
        const query = document.getElementById('advancedSearchInput')?.value.trim() || '';
        startIndex = 0;
        searchBooks(query);
      });

      // Book quantity controls
      bind('decreaseQuantity', 'click', function() {
        const quantityInput = document.getElementById('bookQuantity');
        if (!quantityInput) return;
        const currentQuantity = parseInt(quantityInput.value);
        if (currentQuantity > 1) {
          quantityInput.value = currentQuantity - 1;
        }
      });

      bind('increaseQuantity', 'click', function() {
        const quantityInput = document.getElementById('bookQuantity');
        if (!quantityInput) return;
        const currentQuantity = parseInt(quantityInput.value);
        quantityInput.value = currentQuantity + 1;
      });

      // Add to cart button
      bind('addToCartBtn', 'click', function() {
        if (currentBook) {
          const quantity = parseInt(document.getElementById('bookQuantity')?.value || '1');
          addToCart(currentBook, quantity);
        }
      });

      // Add to wishlist button
      bind('addToWishlistBtn', 'click', function() {
        if (currentBook) {
          addToWishlist(currentBook);
        }
      });

      // Clear cart button
      bind('clearCartBtn', 'click', function() {
        clearCart();
      });

      // User rating stars
      document.querySelectorAll('#userRating i').forEach(star => {
        star.addEventListener('click', function() {
          const rating = parseInt(this.dataset.rating);
          setUserRating(rating);
        });
      });

      // Submit review button
      bind('submitReviewBtn', 'click', function() {
        submitReview();
      });

      // Login button
      bind('loginBtn', 'click', function() {
        login();
      });

      // Register button
      bind('registerBtn', 'click', function() {
        register();
      });

      // Save profile button
      bind('saveProfileBtn', 'click', function() {
        saveProfile();
      });

      // Update password button
      bind('updatePasswordBtn', 'click', function() {
        updatePassword();
      });

      // Save preferences button
      bind('savePreferencesBtn', 'click', function() {
        savePreferences();
      });
      
      // Delete account button
      document.getElementById('deleteAccountBtn').addEventListener('click', function() {
        deleteAccount();
      });
      
      // Logout button
      document.getElementById('logoutBtn').addEventListener('click', function() {
        logout();
      });
      
      // Order confirmation button
      document.getElementById('placeOrderBtn').addEventListener('click', function() {
        placeOrder();
      });
      
      // Continue shopping button
      document.getElementById('continueShoppingBtn').addEventListener('click', function() {
        navigateTo('homePage');
        clearCart();
      });
    }
    
    // Fetch Featured Books from Google Books API
    function fetchFeaturedBooks() {
      showLoader();
      
      // Featured queries - hardcoded for now
      const featuredQueries = [
        'subject:fiction+bestseller',
        'subject:technology+latest',
        'subject:science+fiction+popular',
        'subject:business+bestseller',
        'subject:romance+bestseller'
      ];
      
      const randomQuery = featuredQueries[Math.floor(Math.random() * featuredQueries.length)];
      
      // Fetch featured books
      fetch(`https://www.googleapis.com/books/v1/volumes?q=${randomQuery}&maxResults=10`)
        .then(response => response.json())
        .then(data => {
          renderFeaturedBooks(data.items || []);
          hideLoader();
        })
        .catch(error => {
          console.error('Error fetching featured books:', error);
          hideLoader();
          showToast('Error fetching featured books. Please try again.', 'error');
        });
    }
    
    // Render Featured Books
    function renderFeaturedBooks(books) {
      const featuredBooksContainer = document.getElementById('featuredBooksContainer');
      
      // Clear container
      featuredBooksContainer.innerHTML = '';
      
      // Render books
      books.forEach(book => {
        const bookInfo = book.volumeInfo;
        const saleInfo = book.saleInfo;
        
        // Get book details
        const title = bookInfo.title || 'Unknown Title';
        const authors = bookInfo.authors ? bookInfo.authors.join(', ') : 'Unknown Author';
        const thumbnail = bookInfo.imageLinks ? bookInfo.imageLinks.thumbnail : 'https://cdn.pixabay.com/photo/2015/11/19/21/10/glasses-1052010_1280.jpg';
        const price = saleInfo && saleInfo.retailPrice ? saleInfo.retailPrice.amount : (Math.floor(Math.random() * 30) + 10);
        const rating = bookInfo.averageRating || Math.floor(Math.random() * 5) + 1;
        
        featuredBooksContainer.innerHTML += `
          <div class="swiper-slide">
            <div class="book-card shadow-soft shadow-hover">
              <div class="book-cover">
                <img src="${thumbnail}" alt="${title}">
              </div>
              <div class="book-info">
                <h3 class="book-title">${title}</h3>
                <p class="book-author">${authors}</p>
                <p class="book-price">$${typeof price === 'number' ? price.toFixed(2) : price}</p>
                <div class="book-rating">
                  ${generateRatingStars(rating)}
                </div>
                <div class="book-actions">
                  <button class="btn btn-sm btn-primary flex-grow-1" onclick="addToCart('${book.id}')">Add to Cart</button>
                  <button class="btn btn-sm btn-outline-primary" onclick="viewBookDetails('${book.id}')"><i class="fas fa-eye"></i></button>
                </div>
              </div>
            </div>
          </div>
        `;
      });
    }
    
    // Fetch Books from Google Books API
    function fetchBooks(genre, append = false) {
      showLoader();
      
      // Construct query based on genre
      let query = 'subject:';
      if (genre && genre !== 'all') {
        query += genre;
      } else {
        query = 'bestseller';
      }
      
      // Fetch books
      fetch(`https://www.googleapis.com/books/v1/volumes?q=${query}&startIndex=${startIndex}&maxResults=${maxResults}`)
        .then(response => response.json())
        .then(data => {
          renderBooks(data.items || [], append);
          hideLoader();
        })
        .catch(error => {
          console.error('Error fetching books:', error);
          hideLoader();
          showToast('Error fetching books. Please try again.', 'error');
        });
    }
    
    // Render Books
    function renderBooks(books, append = false) {
      const booksContainer = document.getElementById('booksContainer');
      
      // Clear container if not appending
      if (!append) {
        booksContainer.innerHTML = '';
        startIndex = 0;
      }
      
      // If no books found
      if (books.length === 0 && !append) {
        booksContainer.innerHTML = `
          <div class="col-12 text-center py-5">
            <i class="fas fa-book fa-3x text-muted mb-3"></i>
            <h4>No books found</h4>
            <p class="text-muted">Try searching for something else or browse different categories.</p>
          </div>
        `;
        return;
      }
      
      // Render books
      books.forEach(book => {
        const bookInfo = book.volumeInfo;
        const saleInfo = book.saleInfo;
        
        // Get book details
        const title = bookInfo.title || 'Unknown Title';
        const authors = bookInfo.authors ? bookInfo.authors.join(', ') : 'Unknown Author';
        const thumbnail = bookInfo.imageLinks ? bookInfo.imageLinks.thumbnail : 'https://cdn.pixabay.com/photo/2015/11/19/21/10/glasses-1052010_1280.jpg';
        const price = saleInfo && saleInfo.retailPrice ? saleInfo.retailPrice.amount : (Math.floor(Math.random() * 30) + 10);
        const rating = bookInfo.averageRating || Math.floor(Math.random() * 5) + 1;
        
        booksContainer.innerHTML += `
          <div class="col-md-3 col-sm-6">
            <div class="book-card shadow-soft shadow-hover">
              <div class="book-cover">
                <img src="${thumbnail}" alt="${title}">
              </div>
              <div class="book-info">
                <h3 class="book-title">${title}</h3>
                <p class="book-author">${authors}</p>
                <p class="book-price">$${typeof price === 'number' ? price.toFixed(2) : price}</p>
                <div class="book-rating">
                  ${generateRatingStars(rating)}
                </div>
                <div class="book-actions">
                  <button class="btn btn-sm btn-primary flex-grow-1" onclick="addToCart('${book.id}')">Add to Cart</button>
                  <button class="btn btn-sm btn-outline-primary" onclick="viewBookDetails('${book.id}')"><i class="fas fa-eye"></i></button>
                </div>
              </div>
            </div>
          </div>
        `;
      });
    }
    
    // Search Books
    function searchBooks(query) {
      showLoader();
      
      // Get filter values
      const genre = document.getElementById('genreFilter').value;
      const author = document.getElementById('authorFilter').value;
      const language = document.getElementById('languageFilter').value;
      const freeEbooks = document.getElementById('freeEbooksFilter').checked;
      const sortBy = document.getElementById('sortFilter').value;
      
      // Construct query
      let fullQuery = query;
      
      if (genre) {
        fullQuery += `+subject:${genre}`;
      }
      
      if (author) {
        fullQuery += `+inauthor:${author}`;
      }
      
      // Fetch books
      let apiUrl = `https://www.googleapis.com/books/v1/volumes?q=${fullQuery}&startIndex=${startIndex}&maxResults=${maxResults}`;
      
      if (language) {
        apiUrl += `&langRestrict=${language}`;
      }
      
      if (freeEbooks) {
        apiUrl += '&filter=free-ebooks';
      }
      
      apiUrl += `&orderBy=${sortBy}`;
      
      fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
          renderSearchResults(data);
          hideLoader();
        })
        .catch(error => {
          console.error('Error searching books:', error);
          hideLoader();
          showToast('Error searching books. Please try again.', 'error');
        });
    }
    
    // Render Search Results
    function renderSearchResults(data) {
      const searchResultsContainer = document.getElementById('searchResultsContainer');
      const searchResultsCount = document.getElementById('searchResultsCount');
      const searchPagination = document.getElementById('searchPagination');
      
      // Clear container
      searchResultsContainer.innerHTML = '';
      
      // Update results count
      const totalItems = data.totalItems || 0;
      searchResultsCount.innerHTML = `<strong>${totalItems}</strong> results found`;
      
      // If no books found
      if (!data.items || data.items.length === 0) {
        searchResultsContainer.innerHTML = `
          <div class="col-12 text-center py-5">
            <i class="fas fa-search fa-3x text-muted mb-3"></i>
            <h4>No results found</h4>
            <p class="text-muted">Try adjusting your search or filters to find what you're looking for.</p>
          </div>
        `;
        searchPagination.style.display = 'none';
        return;
      }
      
      // Show pagination if needed
      searchPagination.style.display = totalItems > maxResults ? 'flex' : 'none';
      
      // Render books
      data.items.forEach(book => {
        const bookInfo = book.volumeInfo;
        const saleInfo = book.saleInfo;
        
        // Get book details
        const title = bookInfo.title || 'Unknown Title';
        const authors = bookInfo.authors ? bookInfo.authors.join(', ') : 'Unknown Author';
        const thumbnail = bookInfo.imageLinks ? bookInfo.imageLinks.thumbnail : 'https://cdn.pixabay.com/photo/2015/11/19/21/10/glasses-1052010_1280.jpg';
        const price = saleInfo && saleInfo.retailPrice ? saleInfo.retailPrice.amount : (Math.floor(Math.random() * 30) + 10);
        const rating = bookInfo.averageRating || Math.floor(Math.random() * 5) + 1;
        
        searchResultsContainer.innerHTML += `
          <div class="col-md-4 col-sm-6">
            <div class="book-card shadow-soft shadow-hover">
              <div class="book-cover">
                <img src="${thumbnail}" alt="${title}">
              </div>
              <div class="book-info">
                <h3 class="book-title">${title}</h3>
                <p class="book-author">${authors}</p>
                <p class="book-price">$${typeof price === 'number' ? price.toFixed(2) : price}</p>
                <div class="book-rating">
                  ${generateRatingStars(rating)}
                </div>
                <div class="book-actions">
                  <button class="btn btn-sm btn-primary flex-grow-1" onclick="addToCart('${book.id}')">Add to Cart</button>
                  <button class="btn btn-sm btn-outline-primary" onclick="viewBookDetails('${book.id}')"><i class="fas fa-eye"></i></button>
                </div>
              </div>
            </div>
          </div>
        `;
      });
      
      // Update pagination
      updateSearchPagination(data.totalItems);
    }
    
    // Update Search Pagination
    function updateSearchPagination(totalItems) {
      const searchPagination = document.getElementById('searchPagination');
      const currentPage = Math.floor(startIndex / maxResults) + 1;
      const totalPages = Math.ceil(totalItems / maxResults);
      
      // Clear pagination
      searchPagination.innerHTML = '';
      
      // Previous button
      searchPagination.innerHTML += `
        <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
          <a class="page-link" href="javascript:void(0)" onclick="changePage(${currentPage - 1})" tabindex="-1">
            <i class="fas fa-chevron-left"></i>
          </a>
        </li>
      `;
      
      // Page numbers
      let startPage = Math.max(1, currentPage - 1);
      let endPage = Math.min(totalPages, startPage + 2);
      
      if (endPage - startPage < 2) {
        startPage = Math.max(1, endPage - 2);
      }
      
      for (let i = startPage; i <= endPage; i++) {
        searchPagination.innerHTML += `
          <li class="page-item ${i === currentPage ? 'active' : ''}">
            <a class="page-link" href="javascript:void(0)" onclick="changePage(${i})">${i}</a>
          </li>
        `;
      }
      
      // Next button
      searchPagination.innerHTML += `
        <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
          <a class="page-link" href="javascript:void(0)" onclick="changePage(${currentPage + 1})">
            <i class="fas fa-chevron-right"></i>
          </a>
        </li>
      `;
    }
    
    // Change Search Results Page
    function changePage(pageNumber) {
      startIndex = (pageNumber - 1) * maxResults;
      const query = document.getElementById('advancedSearchInput').value.trim();
      searchBooks(query);
      window.scrollTo(0, 0);
    }
    
    // View Book Details
    function viewBookDetails(bookId) {
      showLoader();
      
      fetch(`https://www.googleapis.com/books/v1/volumes/${bookId}`)
        .then(response => response.json())
        .then(data => {
          renderBookDetails(data);
          currentBook = {
            id: data.id,
            title: data.volumeInfo.title || 'Unknown Title',
            authors: data.volumeInfo.authors ? data.volumeInfo.authors.join(', ') : 'Unknown Author',
            thumbnail: data.volumeInfo.imageLinks ? data.volumeInfo.imageLinks.thumbnail : 'https://cdn.pixabay.com/photo/2015/11/19/21/10/glasses-1052010_1280.jpg',
            price: data.saleInfo && data.saleInfo.retailPrice ? data.saleInfo.retailPrice.amount : (Math.floor(Math.random() * 30) + 10),
            rating: data.volumeInfo.averageRating || Math.floor(Math.random() * 5) + 1
          };
          navigateTo('bookDetailPage');
          fetchSimilarBooks(data.volumeInfo.categories, data.volumeInfo.authors);
          renderBookReviews(data.id);
          hideLoader();
        })
        .catch(error => {
          console.error('Error fetching book details:', error);
          hideLoader();
          showToast('Error fetching book details. Please try again.', 'error');
        });
    }
    
    // Render Book Details
    function renderBookDetails(book) {
      const bookInfo = book.volumeInfo;
      const saleInfo = book.saleInfo;
      
      // Get book details
      const title = bookInfo.title || 'Unknown Title';
      const authors = bookInfo.authors ? bookInfo.authors.join(', ') : 'Unknown Author';
      const thumbnail = bookInfo.imageLinks ? (bookInfo.imageLinks.large || bookInfo.imageLinks.medium || bookInfo.imageLinks.small || bookInfo.imageLinks.thumbnail) : 'https://cdn.pixabay.com/photo/2015/11/19/21/10/glasses-1052010_1280.jpg';
      const price = saleInfo && saleInfo.retailPrice ? saleInfo.retailPrice.amount : (Math.floor(Math.random() * 30) + 10);
      const rating = bookInfo.averageRating || Math.floor(Math.random() * 5) + 1;
      const description = bookInfo.description || 'No description available.';
      const categories = bookInfo.categories || ['General'];
      const pageCount = bookInfo.pageCount || 'Unknown';
      const language = bookInfo.language || 'Unknown';
      const publisher = bookInfo.publisher || 'Unknown';
      const publishedDate = bookInfo.publishedDate || 'Unknown';
      const isbn = bookInfo.industryIdentifiers ? (bookInfo.industryIdentifiers[0].identifier || 'Unknown') : 'Unknown';
      
      // Update breadcrumb
      document.getElementById('bookBreadcrumbTitle').textContent = title;
      document.getElementById('bookCategory').textContent = categories[0];
      
      // Update book details
      document.getElementById('bookDetailImage').src = thumbnail;
      document.getElementById('bookDetailTitle').textContent = title;
      document.getElementById('bookDetailAuthor').textContent = `By ${authors}`;
      document.getElementById('bookDetailRating').innerHTML = `
        ${generateRatingStars(rating)}
        <span class="ms-2 text-muted">(${bookInfo.ratingsCount || 0} reviews)</span>
      `;
      document.getElementById('bookDetailPrice').textContent = `$${typeof price === 'number' ? price.toFixed(2) : price}`;
      document.getElementById('bookDetailDescription').innerHTML = description.substring(0, 300) + (description.length > 300 ? '...' : '');
      document.getElementById('fullBookDescription').innerHTML = description;
      
      // Update book meta
      document.getElementById('bookPublisher').textContent = publisher;
      document.getElementById('bookPublishDate').textContent = publishedDate;
      document.getElementById('bookPages').textContent = pageCount;
      document.getElementById('bookLanguage').textContent = language.toUpperCase();
      document.getElementById('bookISBN').textContent = isbn;
      
      // Update book details list
      const bookDetailsList = document.getElementById('bookDetailsList');
      bookDetailsList.innerHTML = `
        <li class="list-group-item d-flex justify-content-between px-0">
          <span>Format</span>
          <span>${saleInfo.isEbook ? 'eBook' : 'Hardcover'}</span>
        </li>
        <li class="list-group-item d-flex justify-content-between px-0">
          <span>Pages</span>
          <span>${pageCount}</span>
        </li>
        <li class="list-group-item d-flex justify-content-between px-0">
          <span>Publisher</span>
          <span>${publisher}</span>
        </li>
        <li class="list-group-item d-flex justify-content-between px-0">
          <span>Language</span>
          <span>${language.toUpperCase()}</span>
        </li>
        <li class="list-group-item d-flex justify-content-between px-0">
          <span>ISBN</span>
          <span>${isbn}</span>
        </li>
        <li class="list-group-item d-flex justify-content-between px-0">
          <span>Publication Date</span>
          <span>${publishedDate}</span>
        </li>
      `;
      
      // Update book tags
      const bookTagsContainer = document.getElementById('bookTagsContainer');
      bookTagsContainer.innerHTML = '';
      
      categories.forEach(category => {
        bookTagsContainer.innerHTML += `
          <a href="javascript:void(0)" class="badge bg-light text-dark text-decoration-none">${category}</a>
        `;
      });
      
      // Update author section
      document.getElementById('authorName').textContent = authors;
      document.getElementById('authorBio').textContent = `Author of ${title}`;
      document.getElementById('authorFullBio').innerHTML = `
        <p>This is a placeholder for the author bio. In a real application, this would be fetched from an author database or API.</p>
        <p>The author, ${authors}, has written or contributed to ${Math.floor(Math.random() * 20) + 1} books, including "${title}".</p>
      `;
      document.getElementById('authorOtherBooksName').textContent = authors;
      
      // Reset quantity
      document.getElementById('bookQuantity').value = 1;
    }
    
    // Fetch Similar Books
    function fetchSimilarBooks(categories, authors) {
      if (!categories || !categories.length) return;
      
      const category = categories[0];
      const author = authors && authors.length ? authors[0].split(' ')[0] : '';
      
      let query = `subject:${category.toLowerCase().replace(/ /g, '+')}`;
      if (author) {
        query += `+inauthor:${author}`;
      }
      
      fetch(`https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=3`)
        .then(response => response.json())
        .then(data => {
          renderSimilarBooks(data.items || []);
        })
        .catch(error => {
          console.error('Error fetching similar books:', error);
        });
      
      if (author) {
        fetch(`https://www.googleapis.com/books/v1/volumes?q=inauthor:${author}&maxResults=3`)
          .then(response => response.json())
          .then(data => {
            renderAuthorOtherBooks(data.items || []);
          })
          .catch(error => {
            console.error('Error fetching author books:', error);
          });
      }
    }
    
    // Render Similar Books
    function renderSimilarBooks(books) {
      const similarBooksContainer = document.getElementById('similarBooksContainer');
      
      // Clear container
      similarBooksContainer.innerHTML = '';
      
      // If no books found
      if (books.length === 0) {
        similarBooksContainer.innerHTML = '<p class="text-muted">No similar books found.</p>';
        return;
      }
      
      // Filter out current book
      books = books.filter(book => book.id !== currentBook.id);
      
      // Only show up to 3 books
      books = books.slice(0, 3);
      
      // Render books
      books.forEach(book => {
        const bookInfo = book.volumeInfo;
        const saleInfo = book.saleInfo;
        
        // Get book details
        const title = bookInfo.title || 'Unknown Title';
        const authors = bookInfo.authors ? bookInfo.authors.join(', ') : 'Unknown Author';
        const thumbnail = bookInfo.imageLinks ? bookInfo.imageLinks.thumbnail : 'https://cdn.pixabay.com/photo/2015/11/19/21/10/glasses-1052010_1280.jpg';
        const price = saleInfo && saleInfo.retailPrice ? saleInfo.retailPrice.amount : (Math.floor(Math.random() * 30) + 10);
        const rating = bookInfo.averageRating || Math.floor(Math.random() * 5) + 1;
        
        similarBooksContainer.innerHTML += `
          <div class="similar-book d-flex mb-3">
            <img src="${thumbnail}" alt="${title}" width="70" height="100" class="me-3" style="object-fit: cover;">
            <div>
              <h6 class="mb-1">${title}</h6>
              <p class="text-muted small mb-1">${authors}</p>
              <div class="book-rating small mb-1">
                ${generateRatingStars(rating)}
              </div>
              <p class="fw-bold mb-0">$${typeof price === 'number' ? price.toFixed(2) : price}</p>
            </div>
          </div>
        `;
      });
    }
    
    // Render Author's Other Books
    function renderAuthorOtherBooks(books) {
      const authorOtherBooks = document.getElementById('authorOtherBooks');
      
      // Clear container
      authorOtherBooks.innerHTML = '';
      
      // If no books found
      if (books.length === 0) {
        authorOtherBooks.innerHTML = '<p class="text-muted">No other books found by this author.</p>';
        return;
      }
      
      // Filter out current book
      books = books.filter(book => book.id !== currentBook.id);
      
      // Only show up to 3 books
      books = books.slice(0, 3);
      
      // Render books
      books.forEach(book => {
        const bookInfo = book.volumeInfo;
        const thumbnail = bookInfo.imageLinks ? bookInfo.imageLinks.thumbnail : 'https://cdn.pixabay.com/photo/2015/11/19/21/10/glasses-1052010_1280.jpg';
        const title = bookInfo.title || 'Unknown Title';
        
        authorOtherBooks.innerHTML += `
          <div class="col-md-4 col-6">
            <div class="card">
              <img src="${thumbnail}" class="card-img-top" alt="${title}">
              <div class="card-body">
                <h6 class="card-title">${title}</h6>
              </div>
            </div>
          </div>
        `;
      });
    }
    
    // Add to Cart
    function addToCart(bookId, quantity = 1) {
      if (typeof bookId === 'string') {
        showLoader();
        
        fetch(`https://www.googleapis.com/books/v1/volumes/${bookId}`)
          .then(response => response.json())
          .then(data => {
            const bookInfo = data.volumeInfo;
            const saleInfo = data.saleInfo;
            
            const bookItem = {
              id: data.id,
              title: bookInfo.title || 'Unknown Title',
              authors: bookInfo.authors ? bookInfo.authors.join(', ') : 'Unknown Author',
              thumbnail: bookInfo.imageLinks ? bookInfo.imageLinks.thumbnail : 'https://cdn.pixabay.com/photo/2015/11/19/21/10/glasses-1052010_1280.jpg',
              price: saleInfo && saleInfo.retailPrice ? saleInfo.retailPrice.amount : (Math.floor(Math.random() * 30) + 10),
              quantity: quantity
            };
            
            addBookToCart(bookItem);
            hideLoader();
          })
          .catch(error => {
            console.error('Error adding book to cart:', error);
            hideLoader();
            showToast('Error adding book to cart. Please try again.', 'error');
          });
      } else {
        addBookToCart({...bookId, quantity});
      }
    }
    
    // Add Book to Cart
    function addBookToCart(bookItem) {
      // Check if book already in cart
      const existingItemIndex = cart.findIndex(item => item.id === bookItem.id);
      
      if (existingItemIndex !== -1) {
        // Update quantity
        cart[existingItemIndex].quantity += bookItem.quantity;
      } else {
        // Add to cart
        cart.push(bookItem);
      }
      
      // Save to localStorage
      localStorage.setItem('cart', JSON.stringify(cart));
      
      // Update UI
      updateCartUI();
      
      // Show toast
      showToast(`${bookItem.title} added to cart!`, 'success');
    }
    
    // Remove from Cart
    function removeFromCart(index) {
      // Remove item
      cart.splice(index, 1);
      
      // Save to localStorage
      localStorage.setItem('cart', JSON.stringify(cart));
      
      // Update UI
      updateCartUI();
      
      // Show toast
      showToast('Item removed from cart.', 'success');
    }
    
    // Increase Cart Quantity
    function increaseCartQuantity(index) {
      // Increase quantity
      cart[index].quantity++;
      
      // Save to localStorage
      localStorage.setItem('cart', JSON.stringify(cart));
      
      // Update UI
      updateCartUI();
    }
    
    // Decrease Cart Quantity
    function decreaseCartQuantity(index) {
      // Decrease quantity
      if (cart[index].quantity > 1) {
        cart[index].quantity--;
        
        // Save to localStorage
        localStorage.setItem('cart', JSON.stringify(cart));
        
        // Update UI
        updateCartUI();
      }
    }
    
    // Clear Cart
    function clearCart() {
      // Clear cart
      cart = [];
      
      // Save to localStorage
      localStorage.setItem('cart', JSON.stringify(cart));
      
      // Update UI
      updateCartUI();
      
      // Show toast
      showToast('Cart cleared.', 'success');
    }
    
    // Add to Wishlist
    function addToWishlist(book) {
      // Check if book already in wishlist
      const existingItemIndex = wishlist.findIndex(item => item.id === book.id);
      
      if (existingItemIndex !== -1) {
        showToast('This book is already in your wishlist.', 'info');
        return;
      }
      
      // Add to wishlist
      wishlist.push(book);
      
      // Save to localStorage
      localStorage.setItem('wishlist', JSON.stringify(wishlist));
      
      // Show toast
      showToast(`${book.title} added to wishlist!`, 'success');
    }
    
    // Remove from Wishlist
    function removeFromWishlist(index) {
      // Remove item
      wishlist.splice(index, 1);
      
      // Save to localStorage
      localStorage.setItem('wishlist', JSON.stringify(wishlist));
      
      // Update UI
      renderWishlist();
      
      // Show toast
      showToast('Item removed from wishlist.', 'success');
    }
    
    // Add to Cart from Wishlist
    function addToCartFromWishlist(index) {
      // Get book
      const book = wishlist[index];
      
      // Add to cart
      addToCart(book);
    }
    
    // Set User Rating
    function setUserRating(rating) {
      const userRating = document.getElementById('userRating');
      const stars = userRating.querySelectorAll('i');
      
      stars.forEach((star, index) => {
        if (index < rating) {
          star.classList.remove('far');
          star.classList.add('fas');
        } else {
          star.classList.remove('fas');
          star.classList.add('far');
        }
      });
      
      // Store selected rating on the element
      userRating.dataset.rating = rating;
    }
    
    // Submit Review
    function submitReview() {
      if (!currentUser) {
        showToast('Please login to submit a review.', 'error');
        navigateTo('loginPage');
        return;
      }
      
      if (!currentBook) {
        showToast('Something went wrong. Please try again.', 'error');
        return;
      }
      
      const userRating = document.getElementById('userRating');
      const reviewText = document.getElementById('reviewText');
      
      const rating = parseInt(userRating.dataset.rating || 0);
      const text = reviewText.value.trim();
      
      if (rating === 0) {
        showToast('Please select a rating.', 'error');
        return;
      }
      
      if (text === '') {
        showToast('Please enter a review.', 'error');
        return;
      }
      
      // Create review
      const review = {
        bookId: currentBook.id,
        username: `${currentUser.firstName} ${currentUser.lastName}`,
        rating: rating,
        text: text,
        date: new Date().toISOString()
      };
      
      // Add review to book
      if (!reviews[currentBook.id]) {
        reviews[currentBook.id] = [];
      }
      
      reviews[currentBook.id].push(review);
      
      // Save to localStorage
      localStorage.setItem('reviews', JSON.stringify(reviews));
      
      // Reset form
      reviewText.value = '';
      setUserRating(0);
      
      // Update UI
      renderBookReviews(currentBook.id);
      
      // Show toast
      showToast('Review submitted successfully!', 'success');
    }
    
    // Login
    function login() {
      const loginBtn = document.getElementById('loginBtn');
      if (loginBtn) loginBtn.disabled = true;

      const email = document.getElementById('loginEmail').value;
      const password = document.getElementById('loginPassword').value;
      
      if (!email || !password) {
        showToast('Please enter email and password.', 'error');
        if (loginBtn) loginBtn.disabled = false;
        return;
      }
      
      // In a real app, this would be a server request
      // For now, just check local storage
      const usersData = localStorage.getItem('users');
      
      if (usersData) {
        const users = JSON.parse(usersData);
        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
          // Set current user
          currentUser = user;
          
          // Save to localStorage
          localStorage.setItem('currentUser', JSON.stringify(currentUser));
          
          // Update UI
          updateUserUI();
          
          // Navigate to home
          navigateTo('homePage');
          
          // Show toast
          showToast(`Welcome back, ${currentUser.firstName}!`, 'success');
        } else {
          showToast('Invalid email or password.', 'error');
        }
      } else {
        showToast('No users registered. Please register first.', 'error');
      }

      if (loginBtn) loginBtn.disabled = false;
    }
    
    // Register
    function register() {
      const firstName = document.getElementById('registerFirstName').value;
      const lastName = document.getElementById('registerLastName').value;
      const email = document.getElementById('registerEmail').value;
      const password = document.getElementById('registerPassword').value;
      const confirmPassword = document.getElementById('registerConfirmPassword').value;
      const termsCheck = document.getElementById('termsCheck').checked;
      
      if (!firstName || !lastName || !email || !password || !confirmPassword) {
        showToast('Please fill in all fields.', 'error');
        return;
      }
      
      if (password !== confirmPassword) {
        showToast('Passwords do not match.', 'error');
        return;
      }
      
      if (password.length < 8) {
        showToast('Password must be at least 8 characters long.', 'error');
        return;
      }
      
      if (!termsCheck) {
        showToast('Please agree to the Terms of Service and Privacy Policy.', 'error');
        return;
      }
      
      // Send registration to backend
      fetch('http://localhost:3000/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          email: email,
          password: password
        })
      })
      .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.text();
      })
      .then(data => {
        showToast('Registration successful!', 'success');
        // store user in localStorage as well so client-side login works
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        users.push({ firstName, lastName, email, password });
        localStorage.setItem('users', JSON.stringify(users));
        
        // optionally set current user in localStorage
        currentUser = { firstName, lastName, email, password };
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        navigateTo('loginPage');
      })
.catch(err => {
        console.error('Registration error', err);
        showToast('Registration failed. Try again.', 'error');
      });
    }

    // Save Profile
    function saveProfile() {
      if (!currentUser) {
        showToast('Please login first.', 'error');
        navigateTo('loginPage');
        return;
      }
      
      const firstName = document.getElementById('profileFirstName').value;
      const lastName = document.getElementById('profileLastName').value;
      const phone = document.getElementById('profilePhone').value;
      const dob = document.getElementById('profileDob').value;
      
      if (!firstName || !lastName) {
        showToast('Please fill in all required fields.', 'error');
        return;
      }
      
      // Update user
      currentUser.firstName = firstName;
      currentUser.lastName = lastName;
      currentUser.phone = phone;
      currentUser.dob = dob;
      
      // Save to localStorage
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
      
      // Update users array
      const usersData = localStorage.getItem('users');
      if (usersData) {
        const users = JSON.parse(usersData);
        const userIndex = users.findIndex(user => user.email === currentUser.email);
        
        if (userIndex !== -1) {
          users[userIndex] = currentUser;
          localStorage.setItem('users', JSON.stringify(users));
        }
      }
      
      // Update UI
      updateUserUI();
      
      // Show toast
      showToast('Profile updated successfully!', 'success');
    }
    
    // Update Password
    function updatePassword() {
      if (!currentUser) {
        showToast('Please login first.', 'error');
        navigateTo('loginPage');
        return;
      }
      
      const currentPassword = document.getElementById('currentPassword').value;
      const newPassword = document.getElementById('newPassword').value;
      const confirmNewPassword = document.getElementById('confirmNewPassword').value;
      
      if (!currentPassword || !newPassword || !confirmNewPassword) {
        showToast('Please fill in all fields.', 'error');
        return;
      }
      
      if (currentPassword !== currentUser.password) {
        showToast('Current password is incorrect.', 'error');
        return;
      }
      
      if (newPassword !== confirmNewPassword) {
        showToast('New passwords do not match.', 'error');
        return;
      }
      
      if (newPassword.length < 8) {
        showToast('New password must be at least 8 characters long.', 'error');
        return;
      }
      
      // Update user
      currentUser.password = newPassword;
      
      // Save to localStorage
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
      
      // Update users array
      const usersData = localStorage.getItem('users');
      if (usersData) {
        const users = JSON.parse(usersData);
        const userIndex = users.findIndex(user => user.email === currentUser.email);
        
        if (userIndex !== -1) {
          users[userIndex].password = newPassword;
          localStorage.setItem('users', JSON.stringify(users));
        }
      }
      
      // Clear fields
      document.getElementById('currentPassword').value = '';
      document.getElementById('newPassword').value = '';
      document.getElementById('confirmNewPassword').value = '';
      
      // Show toast
      showToast('Password updated successfully!', 'success');
    }
    
    // Save Preferences
    function savePreferences() {
      if (!currentUser) {
        showToast('Please login first.', 'error');
        navigateTo('loginPage');
        return;
      }
      
      const emailNotif = document.getElementById('emailNotif').checked;
      const orderUpdates = document.getElementById('orderUpdates').checked;
      const promotionalEmails = document.getElementById('promotionalEmails').checked;
      const newReleases = document.getElementById('newReleases').checked;
      
      // Update user
      currentUser.preferences = {
        emailNotif,
        orderUpdates,
        promotionalEmails,
        newReleases
      };
      
      // Save to localStorage
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
      
      // Update users array
      const usersData = localStorage.getItem('users');
      if (usersData) {
        const users = JSON.parse(usersData);
        const userIndex = users.findIndex(user => user.email === currentUser.email);
        
        if (userIndex !== -1) {
          users[userIndex].preferences = currentUser.preferences;
          localStorage.setItem('users', JSON.stringify(users));
        }
      }
      
      // Show toast
      showToast('Preferences saved successfully!', 'success');
    }
    
    // Delete Account
    function deleteAccount() {
      if (!currentUser) {
        showToast('Please login first.', 'error');
        navigateTo('loginPage');
        return;
      }
      
      // Confirm deletion
      if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
        return;
      }
      
      // Remove user from users array
      const usersData = localStorage.getItem('users');
      if (usersData) {
        let users = JSON.parse(usersData);
        users = users.filter(user => user.email !== currentUser.email);
        localStorage.setItem('users', JSON.stringify(users));
      }
      
      // Clear current user
      localStorage.removeItem('currentUser');
      currentUser = null;
      
      // Navigate to home
      navigateTo('homePage');
      
      // Show toast
      showToast('Account deleted successfully.', 'success');
      
      // Reload page to update UI
      setTimeout(() => {
        location.reload();
      }, 1500);
    }
    
    // Logout
    function logout() {
      // Clear current user
      localStorage.removeItem('currentUser');
      currentUser = null;
      
      // Navigate to home
      navigateTo('homePage');
      
      // Show toast
      showToast('Logged out successfully.', 'success');
      
      // Reload page to update UI
      setTimeout(() => {
        location.reload();
      }, 1500);
    }
    
    // Place Order
    function placeOrder() {
      if (!currentUser) {
        showToast('Please login to place an order.', 'error');
        navigateTo('loginPage');
        return;
      }
      
      if (cart.length === 0) {
        showToast('Your cart is empty.', 'error');
        return;
      }
      
      // Get form values
      const firstName = document.getElementById('firstName').value;
      const lastName = document.getElementById('lastName').value;
      const email = document.getElementById('email').value;
      const address = document.getElementById('address').value;
      const country = document.getElementById('country').value;
      const state = document.getElementById('state').value;
      const zip = document.getElementById('zip').value;
      
      if (!firstName || !lastName || !email || !address || !country || !state || !zip) {
        showToast('Please fill in all required fields.', 'error');
        return;
      }
      
      // Calculate total
      const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
      const tax = subtotal * 0.1;
      const shipping = 4.99;
      const total = subtotal + tax + shipping;
      
      // Generate order number
      const orderNumber = `BX${Date.now().toString().substring(6)}`;
      
      // Create order
      const order = {
        orderNumber,
        date: new Date().toISOString(),
        customer: {
          name: `${firstName} ${lastName}`,
          email,
          address,
          country,
          state,
          zip
        },
        items: cart,
        subtotal,
        tax,
        shipping,
        total,
        status: 'Processing'
      };
      
      // Send order to backend
      fetch('http://localhost:3000/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_email: currentUser?.email || 'guest',
          order_number: orderNumber,
          total: total,
          status: 'Processing',
          order_details: JSON.stringify(order)
        })
      })
      .then(response => response.text())
      .then(data => {
        console.log('Order response:', data);
      })
      .catch(err => {
        console.error('Order submission error:', err);
      });
      
      // Add to orders
      orders.unshift(order);
      
      // Save to localStorage
      localStorage.setItem('orders', JSON.stringify(orders));
      
      // Update order number in confirmation modal
      document.getElementById('orderNumber').textContent = `#${orderNumber}`;
      
      // Empty cart
      cart = [];
      localStorage.setItem('cart', JSON.stringify(cart));
      
      // Update cart UI
      updateCartUI();
    }
    
    // Page Navigation
    function navigateTo(pageId) {
      // Hide all pages
      document.querySelectorAll('[id$="Page"]').forEach(page => {
        page.style.display = 'none';
      });
      
      // Show selected page
      document.getElementById(pageId).style.display = 'block';
      
      // Update active nav link
      document.querySelectorAll('.navbar-nav .nav-link').forEach(link => {
        link.classList.remove('active');
      });
      
      // Find the nav link that corresponds to this page and make it active
      const navLink = document.querySelector(`.navbar-nav .nav-link[onclick*="${pageId}"]`);
      if (navLink) {
        navLink.classList.add('active');
      }
      
      // Specific page initializations
      if (pageId === 'cartPage') {
        renderCart();
      } else if (pageId === 'checkoutPage') {
        renderOrderSummary();
      } else if (pageId === 'profilePage') {
        if (!currentUser) {
          navigateTo('loginPage');
          showToast('Please login to view your profile.', 'error');
          return;
        }
        
        // Load profile sections
        renderWishlist();
        renderOrderHistory();
        renderAddresses();
        
        // Set default tab
        switchProfileTab('profileInfo');
      }
      
      // Scroll to top
      window.scrollTo(0, 0);
    }

    // Profile Tab Navigation
    function switchProfileTab(tabId) {
      // Hide all profile content tabs
      document.querySelectorAll('#profilePage .profile-content').forEach(tab => {
        tab.style.display = 'none';
      });
      
      // Show selected tab
      document.getElementById(tabId).style.display = 'block';
      
      // Update active menu item
      document.querySelectorAll('#profilePage .profile-menu-item').forEach(item => {
        item.classList.remove('active');
      });
      
      // Find the clicked menu item and make it active
      document.querySelector(`#profilePage .profile-menu-item[onclick*="${tabId}"]`).classList.add('active');
    }
    
    // Generate Rating Stars
    function generateRatingStars(rating) {
      let stars = '';
      
      // Get full and fractional parts
      const fullStars = Math.floor(rating);
      const hasHalfStar = rating - fullStars >= 0.5;
      
      // Add full stars
      for (let i = 0; i < fullStars; i++) {
        stars += '<i class="fas fa-star"></i> ';
      }
      
      // Add half star if needed
      if (hasHalfStar) {
        stars += '<i class="fas fa-star-half-alt"></i> ';
      }
      
      // Add empty stars
      const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
      for (let i = 0; i < emptyStars; i++) {
        stars += '<i class="far fa-star"></i> ';
      }
      
      return stars.trim();
    }
    
    // Toast Notification
    function showToast(message, type = 'info') {
      const toastContainer = document.querySelector('.toast-container');
      
      // Create toast element
      const toast = document.createElement('div');
      toast.className = 'toast';
      
      // Icon based on type
      let icon = 'info-circle';
      let colorClass = 'primary';
      
      if (type === 'success') {
        icon = 'check-circle';
        colorClass = 'success';
      } else if (type === 'error') {
        icon = 'exclamation-circle';
        colorClass = 'danger';
      }
      
      // Create toast content
      toast.innerHTML = `
        <div class="d-flex align-items-center">
          <i class="fas fa-${icon} text-${colorClass} me-2"></i>
          <div>${message}</div>
          <button type="button" class="btn-close ms-auto"></button>
        </div>
      `;
      
      // Add to container
      toastContainer.appendChild(toast);
      
      // Show toast
      setTimeout(() => {
        toast.classList.add('show');
      }, 100);
      
      // Close button handler
      toast.querySelector('.btn-close').addEventListener('click', function() {
        toast.classList.remove('show');
        setTimeout(() => {
          toast.remove();
        }, 300);
      });
      
      // Auto close after 4 seconds
      setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
          toast.remove();
        }, 300);
      }, 4000);
    }
    
    // Loader functions
    function showLoader() {
      document.querySelector('.loader').classList.add('active');
    }
    
    function hideLoader() {
      document.querySelector('.loader').classList.remove('active');
    }