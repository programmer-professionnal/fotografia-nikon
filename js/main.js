(function() {
    const gallery = document.getElementById('gallery');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const filterBtns = document.querySelectorAll('.filter-btn');

    let allImages = {};
    let currentImages = [];
    let currentIndex = -1;

    async function loadImages() {
        gallery.innerHTML = '<div class="empty-state"><p>Cargando fotos...</p></div>';
        
        try {
            const response = await fetch('images.json?t=' + new Date().getTime());
            if (!response.ok) throw new Error('No se pudo cargar images.json');
            allImages = await response.json();
            displayImages('todas');
        } catch (error) {
            console.error('Error:', error);
            gallery.innerHTML = '<div class="empty-state"><p>Error cargando las imágenes<br>Asegúrate de ejecutar generate-images.js</p></div>';
        }
    }

    function displayImages(filter) {
        gallery.innerHTML = '';
        currentImages = [];

        if (filter === 'todas') {
            Object.keys(allImages).forEach(cat => {
                currentImages = currentImages.concat(allImages[cat]);
            });
        } else if (allImages[filter]) {
            currentImages = allImages[filter];
        }

        if (currentImages.length === 0) {
            gallery.innerHTML = '<div class="empty-state"><p>No hay imágenes en esta categoría</p></div>';
            return;
        }

        currentImages.forEach((imgData, index) => {
            const div = document.createElement('div');
            div.className = 'photo';
            div.dataset.category = imgData.category || filter;
            
            const img = document.createElement('img');
            img.src = `images/${imgData.category || filter}/${imgData.file}`;
            img.alt = imgData.title;
            img.loading = 'lazy';
            
            img.onerror = () => div.remove();
            img.onclick = () => openLightbox(index);
            
            div.appendChild(img);
            gallery.appendChild(div);
        });
    }

    function openLightbox(index) {
        currentIndex = index;
        updateLightboxImage();
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function updateLightboxImage() {
        if (currentIndex < 0 || currentIndex >= currentImages.length) return;
        const imgData = currentImages[currentIndex];
        lightboxImg.src = `images/${imgData.category}/${imgData.file}`;
        lightboxCaption.textContent = imgData.title;
    }

    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = 'auto';
        currentIndex = -1;
    }

    function nextImage() {
        if (currentImages.length === 0) return;
        currentIndex = (currentIndex + 1) % currentImages.length;
        updateLightboxImage();
    }

    function prevImage() {
        if (currentImages.length === 0) return;
        currentIndex = (currentIndex - 1 + currentImages.length) % currentImages.length;
        updateLightboxImage();
    }

    lightbox.querySelector('.close').onclick = closeLightbox;
    
    lightbox.querySelector('.prev').onclick = (e) => {
        e.stopPropagation();
        prevImage();
    };
    
    lightbox.querySelector('.next').onclick = (e) => {
        e.stopPropagation();
        nextImage();
    };
    
    lightbox.onclick = (e) => {
        if (e.target === lightbox) closeLightbox();
    };

    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowRight') nextImage();
        if (e.key === 'ArrowLeft') prevImage();
    });

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            displayImages(btn.dataset.filter);
        });
    });

    loadImages();
})();
