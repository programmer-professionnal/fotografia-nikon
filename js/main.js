const gallery = document.getElementById('gallery');
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxCaption = document.getElementById('lightbox-caption');
const filterBtns = document.querySelectorAll('.filter-btn');

const categories = ['naturaleza', 'retratos', 'nocturnas', 'urbanas', 'atardeceres', 'amaneceres', 'macro'];
const repoOwner = 'programmer-professionnal';
const repoName = 'fotografia-nikon';
const branch = 'master';

let allImages = {};
let currentImages = [];
let currentIndex = -1;

async function fetchImagesFromGitHub(category) {
    const url = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/images/${category}?ref=${branch}`;
    try {
        const response = await fetch(url);
        if (!response.ok) return [];
        const files = await response.json();
        return files
            .filter(file => /\.(jpg|jpeg|png|webp)$/i.test(file.name))
            .map(file => ({
                file: file.name,
                title: file.name.replace(/\.[^/.]+$/, "").replace(/-/g, ' '),
                category: category,
                url: `https://raw.githubusercontent.com/${repoOwner}/${repoName}/${branch}/images/${category}/${encodeURIComponent(file.name)}`
            }));
    } catch (error) {
        console.error(`Error fetching ${category}:`, error);
        return [];
    }
}

async function loadImages() {
    gallery.innerHTML = '<div class="empty-state"><p>Cargando fotos...</p></div>';
    
    const promises = categories.map(cat => fetchImagesFromGitHub(cat));
    const results = await Promise.all(promises);
    
    categories.forEach((cat, i) => {
        allImages[cat] = results[i];
    });
    
    displayImages('todas');
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
        div.dataset.category = imgData.category;
        
        const img = document.createElement('img');
        img.src = imgData.url;
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
    lightboxImg.src = imgData.url;
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
