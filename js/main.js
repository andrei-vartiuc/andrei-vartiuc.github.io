/* ==========================================================================
   MAIN JAVASCRIPT LOGIC
   Typing effect, Project Filters, Modal Preview, Copy Email, 3D Tilt, ScrollSpy
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // --------------------------------------------------------------------------
  // 1. Mobile Menu Toggle
  // --------------------------------------------------------------------------
  const navToggle = document.getElementById('nav-toggle');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
      const icon = navToggle.querySelector('i');
      if (icon) {
        icon.classList.toggle('ri-menu-4-line');
        icon.classList.toggle('ri-close-line');
      }
    });

    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        const icon = navToggle.querySelector('i');
        if (icon) {
          icon.classList.add('ri-menu-4-line');
          icon.classList.remove('ri-close-line');
        }
      });
    });
  }

  // --------------------------------------------------------------------------
  // 2. Navbar Scroll Effect & Active Link ScrollSpy
  // --------------------------------------------------------------------------
  const navbar = document.getElementById('navbar');
  const sections = document.querySelectorAll('section[id]');

  function updateNavbar() {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    const scrollY = window.pageYOffset;
    sections.forEach(current => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop - 120;
      const sectionId = current.getAttribute('id');
      const navItem = document.querySelector(`.nav-menu a[href*="${sectionId}"]`);

      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        if (navItem) navItem.classList.add('active');
      } else {
        if (navItem) navItem.classList.remove('active');
      }
    });
  }

  window.addEventListener('scroll', updateNavbar);
  updateNavbar();

  // --------------------------------------------------------------------------
  // 3. Project Category Filtering
  // --------------------------------------------------------------------------
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      projectCards.forEach(card => {
        const categories = (card.getAttribute('data-category') || '').split(' ');
        if (filter === 'all' || categories.includes(filter)) {
          card.style.display = 'flex';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'scale(1)';
          }, 10);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'scale(0.95)';
          setTimeout(() => {
            card.style.display = 'none';
          }, 200);
        }
      });
    });
  });

  // --------------------------------------------------------------------------
  // 4. Multi-Image Carousel for Project Cards
  // --------------------------------------------------------------------------
  projectCards.forEach(card => {
    const rawImages = card.getAttribute('data-images');
    let images = [];
    try {
      images = rawImages ? JSON.parse(rawImages) : [];
    } catch (e) {
      images = [];
    }

    if (images.length <= 1) return;

    let currentIndex = 0;
    const imgEl = card.querySelector('.project-card-img');
    const prevBtn = card.querySelector('.card-slider-btn.prev');
    const nextBtn = card.querySelector('.card-slider-btn.next');
    const dots = card.querySelectorAll('.card-slider-dots .dot');
    const badge = card.querySelector('.card-img-badge');

    function showImage(index) {
      if (index < 0) index = images.length - 1;
      if (index >= images.length) index = 0;
      currentIndex = index;

      if (imgEl) {
        imgEl.style.opacity = '0.5';
        setTimeout(() => {
          imgEl.src = images[currentIndex];
          imgEl.style.opacity = '1';
        }, 120);
      }

      dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === currentIndex);
      });

      if (badge) {
        badge.innerHTML = `<i class="ri-image-line"></i> ${currentIndex + 1}/${images.length}`;
      }
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        showImage(currentIndex - 1);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        showImage(currentIndex + 1);
      });
    }

    dots.forEach((dot, i) => {
      dot.addEventListener('click', (e) => {
        e.stopPropagation();
        showImage(i);
      });
    });

    card._getCurrentImageIndex = () => currentIndex;
    card._getImages = () => images;
  });

  // --------------------------------------------------------------------------
  // 5. Project Preview Modal with Multi-Image Carousel & Thumbnails
  // --------------------------------------------------------------------------
  const modal = document.getElementById('project-modal');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalTitle = document.getElementById('modal-title');
  const modalDesc = document.getElementById('modal-desc');
  const modalImg = document.getElementById('modal-img');
  const modalTag = document.getElementById('modal-tag');
  const modalTech = document.getElementById('modal-tech');
  const modalPrevBtn = document.getElementById('modal-prev-btn');
  const modalNextBtn = document.getElementById('modal-next-btn');
  const modalCounter = document.getElementById('modal-counter');
  const modalThumbnails = document.getElementById('modal-thumbnails');
  const modalGithub = document.getElementById('modal-github');
  const modalDemo = document.getElementById('modal-demo');

  let modalImages = [];
  let modalIndex = 0;

  function updateModalImage(index) {
    if (!modalImages || modalImages.length === 0) return;
    if (index < 0) index = modalImages.length - 1;
    if (index >= modalImages.length) index = 0;
    modalIndex = index;

    if (modalImg) {
      modalImg.style.opacity = '0.3';
      setTimeout(() => {
        modalImg.src = modalImages[modalIndex];
        modalImg.style.opacity = '1';
      }, 100);
    }

    if (modalCounter) {
      modalCounter.textContent = `${modalIndex + 1} / ${modalImages.length}`;
      modalCounter.style.display = modalImages.length > 1 ? 'block' : 'none';
    }

    if (modalPrevBtn && modalNextBtn) {
      const display = modalImages.length > 1 ? 'flex' : 'none';
      modalPrevBtn.style.display = display;
      modalNextBtn.style.display = display;
    }

    const thumbs = modalThumbnails?.querySelectorAll('.modal-thumb');
    thumbs?.forEach((thumb, i) => {
      thumb.classList.toggle('active', i === modalIndex);
    });
  }

  function openProjectModal(card) {
    const title = card.getAttribute('data-title') || card.querySelector('.project-title')?.textContent;
    const desc = card.getAttribute('data-desc') || card.querySelector('.project-summary')?.textContent;
    const category = card.querySelector('.project-category-tag')?.textContent;
    const techItems = card.querySelectorAll('.project-tech-tags span');

    // Retrieve images array
    const rawImages = card.getAttribute('data-images');
    try {
      modalImages = rawImages ? JSON.parse(rawImages) : [card.querySelector('.project-card-img')?.src];
    } catch (e) {
      modalImages = [card.querySelector('.project-card-img')?.src];
    }

    // Current index on card
    modalIndex = typeof card._getCurrentImageIndex === 'function' ? card._getCurrentImageIndex() : 0;

    modalTitle.textContent = title;
    modalDesc.textContent = desc;
    modalTag.textContent = category;

    // Tech tags
    modalTech.innerHTML = '';
    techItems.forEach(t => {
      const span = document.createElement('span');
      span.className = 'skill-pill';
      span.textContent = t.textContent;
      modalTech.appendChild(span);
    });

    // Links
    const linkBtns = card.querySelectorAll('.project-links a');
    let liveUrl = null;
    let githubUrl = null;

    linkBtns.forEach(a => {
      if (a.href.includes('github.com')) {
        githubUrl = a.href;
      } else if (a.href && a.href !== '#' && !a.href.startsWith('javascript')) {
        liveUrl = a.href;
      }
    });

    if (liveUrl && modalDemo) {
      modalDemo.href = liveUrl;
      modalDemo.style.display = 'inline-flex';
    } else if (modalDemo) {
      modalDemo.style.display = 'none';
    }

    if (githubUrl && modalGithub) {
      modalGithub.href = githubUrl;
      modalGithub.style.display = 'inline-flex';
    } else if (modalGithub) {
      modalGithub.style.display = 'none';
    }

    // Build thumbnails
    if (modalThumbnails) {
      modalThumbnails.innerHTML = '';
      if (modalImages.length > 1) {
        modalThumbnails.style.display = 'flex';
        modalImages.forEach((src, idx) => {
          const thumb = document.createElement('div');
          thumb.className = `modal-thumb ${idx === modalIndex ? 'active' : ''}`;
          thumb.innerHTML = `<img src="${src}" alt="Miniature ${idx + 1}" />`;
          thumb.addEventListener('click', () => updateModalImage(idx));
          modalThumbnails.appendChild(thumb);
        });
      } else {
        modalThumbnails.style.display = 'none';
      }
    }

    updateModalImage(modalIndex);

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  const modalZoomBtn = document.getElementById('modal-zoom-btn');
  const modalCard = modal?.querySelector('.modal-card');

  function toggleFullscreen() {
    if (!modalCard) return;
    const isFullscreen = modalCard.classList.toggle('fullscreen-mode');
    if (modalZoomBtn) {
      modalZoomBtn.innerHTML = isFullscreen 
        ? '<i class="ri-zoom-out-line"></i>' 
        : '<i class="ri-zoom-in-line"></i>';
      modalZoomBtn.title = isFullscreen ? 'Réduire' : 'Agrandir / Plein écran';
    }
  }

  if (modalZoomBtn) {
    modalZoomBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleFullscreen();
    });
  }

  if (modalImg) {
    modalImg.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleFullscreen();
    });
  }

  function closeProjectModal() {
    modal.classList.remove('active');
    if (modalCard) {
      modalCard.classList.remove('fullscreen-mode');
      if (modalZoomBtn) {
        modalZoomBtn.innerHTML = '<i class="ri-zoom-in-line"></i>';
        modalZoomBtn.title = 'Agrandir / Plein écran';
      }
    }
    document.body.style.overflow = 'auto';
  }

  if (modalPrevBtn) {
    modalPrevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      updateModalImage(modalIndex - 1);
    });
  }

  if (modalNextBtn) {
    modalNextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      updateModalImage(modalIndex + 1);
    });
  }

  document.querySelectorAll('.project-preview-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const card = btn.closest('.project-card');
      openProjectModal(card);
    });
  });

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', closeProjectModal);
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeProjectModal();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (modal && modal.classList.contains('active')) {
      if (e.key === 'Escape') closeProjectModal();
      if (e.key === 'ArrowLeft') updateModalImage(modalIndex - 1);
      if (e.key === 'ArrowRight') updateModalImage(modalIndex + 1);
      if (e.key === 'f' || e.key === 'F') toggleFullscreen();
    }
  });

  // --------------------------------------------------------------------------
  // 6. Copy Email with Toast Notification
  // --------------------------------------------------------------------------
  const copyBtn = document.getElementById('copy-email-btn');
  const emailElement = document.getElementById('email-text');
  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toast-message');

  function showToast(message) {
    if (!toast) return;
    toastMessage.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3200);
  }

  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const email = emailElement?.textContent?.trim() || 'andrei.vartiuc@epita.fr';
      navigator.clipboard.writeText(email).then(() => {
        showToast(`✓ Email copié : ${email}`);
      }).catch(() => {
        showToast(`Email : ${email}`);
      });
    });
  }

});
