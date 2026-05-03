import { useEffect, useRef } from "react";
import "./index.css";

export default function App() {

  // ── all your <script> logic goes into useEffect ──
  useEffect(() => {

    // 1. PAGE LOADER
    const loaderTimer = setTimeout(() => {
      document.getElementById("loader")?.classList.add("done");
      startCountUps();
    }, 2000);

    // 2. PROGRESS BAR
    const onScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = (scrollTop / docHeight) * 100;
      const bar = document.getElementById("progress-bar");
      if (bar) bar.style.width = pct + "%";

      // parallax
      const parallaxImg = document.getElementById("parallax-img");
      if (parallaxImg && scrollTop < window.innerHeight * 1.2) {
        parallaxImg.style.transform = `translateY(${scrollTop * 0.18}px)`;
      }
    };
    window.addEventListener("scroll", onScroll);

const cur = document.getElementById("cur");
const curLabel = document.getElementById("cur-label");
let mx = 0, my = 0;

const onMouseMove = (e) => {
  mx = e.clientX; my = e.clientY;
  if (cur) { cur.style.left = mx + "px"; cur.style.top = my + "px"; }
  if (curLabel) { curLabel.style.left = mx + "px"; curLabel.style.top = my + "px"; }
  const glow = document.getElementById("mouse-glow");
  if (glow) { glow.style.left = mx + "px"; glow.style.top = my + "px"; }
  spawnTrail(mx, my);

  // orb parallax
  const xFrac = (e.clientX / window.innerWidth - 0.5) * 20;
  const yFrac = (e.clientY / window.innerHeight - 0.5) * 20;
  document.querySelectorAll(".orb").forEach((orb, i) => {
    const factor = (i + 1) * 0.4;
    orb.style.transform = `translate(${xFrac * factor}px, ${yFrac * factor}px)`;
  });
};
window.addEventListener("mousemove", onMouseMove);

// cursor expands on hoverable elements
document.querySelectorAll("[data-cursor]").forEach((el) => {
  el.addEventListener("mouseenter", () => {
    if (curLabel) { curLabel.textContent = el.dataset.cursor; curLabel.classList.add("show"); }
    if (cur) cur.classList.add("expanded");
  });
  el.addEventListener("mouseleave", () => {
    if (curLabel) curLabel.classList.remove("show");
    if (cur) cur.classList.remove("expanded");
  });
});

    // 4. TRAIL DOTS
    const trailPool = [];
    for (let i = 0; i < 12; i++) {
      const d = document.createElement("div");
      d.className = "trail-dot";
      d.style.opacity = "0";
      document.body.appendChild(d);
      trailPool.push(d);
    }
    let trailIndex = 0;
    function spawnTrail(x, y) {
      const dot = trailPool[trailIndex % 12];
      dot.style.left = x + "px"; dot.style.top = y + "px";
      dot.style.opacity = "0.5";
      dot.style.transform = "translate(-50%,-50%) scale(1)";
      dot.style.transition = "none";
      setTimeout(() => {
        dot.style.transition = "opacity 0.5s ease, transform 0.5s ease";
        dot.style.opacity = "0"; dot.style.transform = "translate(-50%,-50%) scale(0.3)";
      }, 30);
      trailIndex++;
    }

    // 5. SCROLL ANIMATIONS
    document.querySelectorAll(".word-reveal").forEach((el) => {
      el.childNodes.forEach((node) => {
        if (node.nodeType === 3) {
          const words = node.textContent.split(/(\s+)/);
          const frag = document.createDocumentFragment();
          words.forEach((w) => {
            if (w.trim() === "") { frag.appendChild(document.createTextNode(w)); return; }
            const span = document.createElement("span");
            span.className = "word";
            span.innerHTML = `<span class="word-inner">${w}</span>`;
            frag.appendChild(span);
          });
          node.replaceWith(frag);
        } else if (node.nodeType === 1) {
          const inner = node.textContent;
          node.innerHTML = `<span class="word"><span class="word-inner">${inner}</span></span>`;
        }
      });
    });

    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("visible"); }),
      { threshold: 0.12 }
    );
    document.querySelectorAll(".fade-in").forEach((el) => observer.observe(el));

    document.querySelectorAll(".word-reveal").forEach((el) => {
      const wo = new IntersectionObserver(
        (entries) => entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("visible");
            e.target.querySelectorAll(".word-inner").forEach((w, i) => {
              w.style.transitionDelay = i * 0.06 + "s";
            });
          }
        }),
        { threshold: 0.15 }
      );
      wo.observe(el);
    });

    document.querySelectorAll(".section-transition").forEach((bar) => {
      const bo = new IntersectionObserver(
        (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("visible"); }),
        { threshold: 0.5 }
      );
      bo.observe(bar);
    });

    // 6. HORIZONTAL SCROLL DRAG
    const track = document.getElementById("worksTrack");
    if (track) {
      let isDown = false, startX = 0, scrollLeft = 0;
      track.addEventListener("mousedown", (e) => {
        isDown = true; track.style.cursor = "grabbing";
        startX = e.pageX - track.offsetLeft; scrollLeft = track.parentElement.scrollLeft;
      });
      track.addEventListener("mouseleave", () => { isDown = false; track.style.cursor = "grab"; });
      track.addEventListener("mouseup", () => { isDown = false; track.style.cursor = "grab"; });
      track.addEventListener("mousemove", (e) => {
        if (!isDown) return; e.preventDefault();
        const x = e.pageX - track.offsetLeft;
        track.parentElement.scrollLeft = scrollLeft - (x - startX) * 1.5;
      });
      track.parentElement.style.overflowX = "auto";
      track.parentElement.style.scrollbarWidth = "none";
      track.parentElement.style.cursor = "grab";
    }

    // 7. CAROUSELS
    document.querySelectorAll(".carousel").forEach((carousel) => {
      const cTrack = carousel.querySelector(".carousel-track");
      const images = carousel.querySelectorAll(".carousel-img");
      const prev = carousel.querySelector(".prev");
      const next = carousel.querySelector(".next");
      let index = 0;
      next?.addEventListener("click", () => {
        index = (index + 1) % images.length;
        cTrack.style.transform = `translateX(-${index * 100}%)`;
      });
      prev?.addEventListener("click", () => {
        index = (index - 1 + images.length) % images.length;
        cTrack.style.transform = `translateX(-${index * 100}%)`;
      });
    });

    // 8. LIGHTBOX
    const lightbox = document.getElementById("lightbox");
    document.querySelectorAll(".work-card").forEach((card) => {
      card.addEventListener("click", (e) => {
        if (e.target.classList.contains("carousel-btn")) return;
        document.getElementById("lb-title").innerText = card.querySelector(".work-title")?.innerText || "";
        document.getElementById("lb-tag").innerText = card.querySelector(".work-tag")?.innerText || "";
        document.getElementById("lb-desc").innerText = card.querySelector(".work-desc")?.innerText || "";
        document.getElementById("lb-tools").innerHTML = `<strong>Tools:</strong> ${card.querySelector(".work-tool")?.innerText || ""}`;
        const imgSide = document.querySelector(".lb-image-side");
        const isCarousel = card.querySelector(".carousel-track");
        if (isCarousel) {
          const imgs = [...card.querySelectorAll(".carousel-img")].map((i) => i.src);
          window._lbImgs = imgs; window._lbIdx = 0;
          imgSide.innerHTML = `<div style="position:relative;width:100%">
            <img id="lb-main-img" src="${imgs[0]}" style="width:100%;max-height:70vh;object-fit:contain;border-radius:4px">
            <button onclick="changeLbSlide(-1)" style="position:absolute;left:10px;top:50%;transform:translateY(-50%);background:rgba(0,0,0,0.5);color:white;border:none;font-size:1.5rem;padding:6px 12px;cursor:pointer;border-radius:4px">‹</button>
            <button onclick="changeLbSlide(1)" style="position:absolute;right:10px;top:50%;transform:translateY(-50%);background:rgba(0,0,0,0.5);color:white;border:none;font-size:1.5rem;padding:6px 12px;cursor:pointer;border-radius:4px">›</button>
          </div>`;
        } else {
          const firstImg = card.querySelector("img");
          imgSide.innerHTML = `<img src="${firstImg?.src || ""}" style="width:100%;max-height:70vh;object-fit:contain;border-radius:4px">`;
        }
        if (lightbox) { lightbox.style.display = "flex"; document.body.style.overflow = "hidden"; }
      });
    });

    window.changeLbSlide = (dir) => {
      const imgs = window._lbImgs;
      window._lbIdx = (window._lbIdx + dir + imgs.length) % imgs.length;
      document.getElementById("lb-main-img").src = imgs[window._lbIdx];
    };

    document.getElementById("close-lightbox")?.addEventListener("click", (e) => {
      e.stopPropagation();
      if (lightbox) { lightbox.style.display = "none"; document.body.style.overflow = "auto"; }
    });

    lightbox?.addEventListener("click", (e) => {
      if (e.target === lightbox) { lightbox.style.display = "none"; document.body.style.overflow = "auto"; }
    });

    // COUNT UP
    function startCountUps() {
      document.querySelectorAll(".count-up").forEach((el) => {
        const target = parseInt(el.dataset.target);
        let current = 0;
        const increment = target / 40;
        const timer = setInterval(() => {
          current += increment;
          if (current >= target) { el.textContent = target + "+"; clearInterval(timer); }
          else el.textContent = Math.floor(current);
        }, 40);
      });
    }

    // SCROLLBAR HIDE STYLE
    const style = document.createElement("style");
    style.textContent = ".works-scroll-wrapper::-webkit-scrollbar{display:none}";
    document.head.appendChild(style);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("mousemove", onMouseMove);
      clearTimeout(loaderTimer);
      trailPool.forEach((d) => d.remove());
    };
  }, []);

  return (
    <>
      <div id="progress-bar"></div>
      <div id="grain"></div>
      <div id="mouse-glow"></div>
      <div className="cursor" id="cur"></div>
      <div className="cursor-label" id="cur-label"></div>

      <div id="loader">
        <div className="loader-name">Anshika.</div>
        <div className="loader-bar-wrap"><div className="loader-bar-inner"></div></div>
        <div className="loader-sub">Loading portfolio</div>
      </div>

      <nav>
        <div className="nav-logo">Anshika.</div>
        <div className="nav-links">
          <a href="#about">About</a>
          <a href="#skills">Skills</a>
          <a href="#works">Works</a>
          <a href="#contact">Contact</a>
        </div>
      </nav>

      <section className="hero" id="home">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>
        <div style={{position:"relative",zIndex:2}}>
          <div className="hero-tag">Graphic Designer & Creative</div>
          <h1 className="hero-name">Design<br/>that <em>tells<br/>stories</em></h1>
          <p className="hero-desc">Hi, I'm Anshika, a B.Tech CSE student and self-taught graphic designer crafting posters, UI & social media visuals that are clean, modern, and scroll-stopping.</p>
          <div className="hero-btns">
            <button className="btn-primary" data-cursor="View Work →" onClick={() => document.getElementById("works").scrollIntoView({behavior:"smooth"})}>View My Work</button>
            <a className="btn-ghost" data-cursor="Let's Talk →" href="#contact">Let's Talk →</a>
          </div>
          <div className="hero-stat-row" style={{marginTop:"3rem"}}>
            <div className="stat"><span className="stat-num count-up" data-target="2">0</span><span className="stat-label">Years Exp.</span></div>
            <div className="stat"><span className="stat-num count-up" data-target="3">0</span><span className="stat-label">Key Tools</span></div>
            <div className="stat"><span className="stat-num">∞</span><span className="stat-label">Ideas</span></div>
          </div>
        </div>
        <div className="hero-right" style={{position:"relative",zIndex:2}}>
          <div className="hero-img-wrap" id="parallax-img">
            <img src="/anshika-photo.jpeg" alt="Anshika" onError={(e)=>{e.target.style.background="#3A2520";e.target.removeAttribute("src")}}/>
          </div>
          <div className="hero-scroll">Scroll to explore</div>
        </div>
      </section>

      <div className="section-transition"></div>

      <section className="about" id="about">
        <div className="section-label fade-in">About me</div>
        <div className="about-grid">
          <div className="fade-in stagger-1">
            <h2 className="section-title word-reveal" style={{marginBottom:"1.5rem"}}>Structure meets <em>creativity</em></h2>
            <p className="about-quote">"I enjoy mixing structure with creativity, making ideas look clean, modern, and scrollable."</p>
            <p className="about-text">For the past 2 years, I've been creating posters, social media visuals, and UI designs for college events and personal projects. Currently pursuing B.Tech in Computer Science, which gives me an edge in understanding both design and the tech behind it.</p>
          </div>
          <div className="about-right fade-in stagger-2">
            <div className="info-row"><span className="info-label">Role</span><span className="info-val">Graphic Designer</span></div>
            <div className="info-row"><span className="info-label">Education</span><span className="info-val">B.Tech CSE — IGDTUW</span></div>
            <div className="info-row"><span className="info-label">Experience</span><span className="info-val">2+ Years</span></div>
            <div className="info-row"><span className="info-label">Internship</span><span className="info-val">Metvy (Oct–Dec 2025)</span></div>
            <div className="info-row"><span className="info-label">Location</span><span className="info-val">Delhi, India</span></div>
            <div className="info-row"><span className="info-label">Status</span><span className="info-val" style={{color:"#7ec87e"}}>Open to Opportunities</span></div>
          </div>
        </div>
      </section>

      <div className="section-transition"></div>

      <section className="skills" id="skills">
        <div className="section-label fade-in">What I do</div>
        <h2 className="section-title fade-in word-reveal">Skills &amp; <em>Tools</em></h2>
        <div className="skills-grid">
          <div className="skill-card fade-in stagger-1">
            <div className="skill-card-label">Design Skills</div>
            <div className="skill-items">
              {["Visual Communication","Social Media Design","UI Design (basic)","Branding & Layouts","Editorial Design","Digital Collage"].map(s=><span key={s} className="pill">{s}</span>)}
            </div>
          </div>
          <div className="skill-card fade-in stagger-2">
            <div className="skill-card-label">Tools</div>
            <div className="skill-items">
              {["Figma","Canva","Illustrator (basic)"].map(s=><span key={s} className="pill tool">{s}</span>)}
            </div>
          </div>
          <div className="skill-card fade-in stagger-3" style={{gridColumn:"1/-1"}}>
            <div className="skill-card-label">Specialties</div>
            <div className="skill-items">
              {["LinkedIn Carousels","Instagram Grid Strategy","Event Posters","Conceptual Art","Content Hierarchy","Typography"].map(s=><span key={s} className="pill">{s}</span>)}
            </div>
          </div>
        </div>
      </section>

      <div className="section-transition"></div>

      <section className="experience" id="experience">
        <div className="section-label fade-in">Where I've worked</div>
        <h2 className="section-title fade-in word-reveal"><em>Experience</em></h2>
        <div className="exp-card fade-in">
          <div className="exp-header">
            <div><div className="exp-role">Graphic Design Intern</div><div className="exp-company">Metvy</div></div>
            <div className="exp-date">Oct – Dec 2025</div>
          </div>
          <ul className="exp-bullets">
            <li>Designed professional LinkedIn posts and carousels focused on business, marketing, finance, and Founder's Office content.</li>
            <li>Created clean, structured layouts with formal visual tone ensuring clarity, hierarchy, and brand consistency.</li>
            <li>Collaborated with the team to translate complex, text-heavy ideas into visually engaging structured designs.</li>
          </ul>
        </div>
        <div className="exp-card fade-in">
          <div className="exp-header">
            <div><div className="exp-role">Media Head</div><div className="exp-company">Music Society — IGDTUW</div></div>
            <div className="exp-date">2025–26</div>
          </div>
          <ul className="exp-bullets">
            <li>Managed social media presence and developed a standout strategy for the annual Core Team announcement.</li>
            <li>Conceptualised and designed a 12-post Instagram grid strategy forming a large cohesive 'hero image' on the profile page.</li>
            <li>Chose a retro film strip aesthetic — visually spotlighting each team member in their own frame with a consistent visual language.</li>
          </ul>
        </div>
      </section>

      <div className="section-transition"></div>

      <section className="works" id="works">
        <div className="works-header">
          <div className="section-label fade-in">Selected projects</div>
          <h2 className="section-title fade-in word-reveal" style={{marginBottom:0}}>Some of my <em>Works</em></h2>
        </div>
        <div className="scroll-hint fade-in">
          <div className="scroll-hint-line"></div>
          <span>Drag to explore</span>
          <span className="scroll-hint-arrow">→</span>
        </div>
        <div className="works-scroll-wrapper">
          <div className="works-track" id="worksTrack">

            <div className="work-card" data-cursor="View →">
              <div className="work-img-wrap carousel">
                <div className="carousel-track">
                  {[1,2,3,4,5,6,7,8,9].map(n=><img key={n} src={`/metvy${n}.jpeg`} className="carousel-img work-img" alt={`Metvy ${n}`}/>)}
                </div>
                <button className="carousel-btn prev">‹</button>
                <button className="carousel-btn next">›</button>
              </div>
              <div className="work-body">
                <div className="work-tag">LinkedIn Carousel · Canva</div>
                <div className="work-title">Metvy — LinkedIn Carousels</div>
                <p className="work-desc">Professional carousels for a B2B brand — business, finance, and founder content with clean layouts and strong visual hierarchy.</p>
                <div className="work-tool">Canva · Figma</div>
              </div>
            </div>

            <div className="work-card" data-cursor="View →">
              <div className="work-img-wrap"><img className="work-img" src="/theyseeeverything.jpeg" alt="They See Everything"/></div>
              <div className="work-body">
                <div className="work-tag">Conceptual Art · Figma</div>
                <div className="work-title">They See E.V.E.R.Y.T.H.I.N.G.</div>
                <p className="work-desc">A digital collage exploring the erosion of privacy in our hyper-connected world — personal devices as windows for constant surveillance.</p>
                <div className="work-tool">Figma · Pinterest · Cosmos</div>
              </div>
            </div>

            <div className="work-card" data-cursor="View →">
              <div className="work-img-wrap"><img className="work-img" src="/muscleblaze.jpeg" alt="Ladies Who Lift poster"/></div>
              <div className="work-body">
                <div className="work-tag">Event Poster · Canva</div>
                <div className="work-title">Ladies Who Lift — Taarangana</div>
                <p className="work-desc">A bold, high-energy International Women's Day event poster. Bold palette and dynamic typography capturing the strength of the event.</p>
                <div className="work-tool">Canva</div>
              </div>
            </div>

            <div className="work-card" data-cursor="View →">
              <div className="work-img-wrap"><img className="work-img" src="/rid.jpeg" alt="Elastic Truths"/></div>
              <div className="work-body">
                <div className="work-tag">Conceptual Art · Figma</div>
                <div className="work-title">Elastic Truths</div>
                <p className="work-desc">A layered digital collage visualising the tension between internal self and identity shaped by external perception.</p>
                <div className="work-tool">Figma · Pinterest · Cosmos</div>
              </div>
            </div>

            <div className="work-card" data-cursor="View →">
              <div className="work-img-wrap"><img className="work-img" src="/coreteam.jpeg" alt="Core Team grid"/></div>
              <div className="work-body">
                <div className="work-tag">Instagram Grid · Figma</div>
                <div className="work-title">Core Team 2025–26 Reveal</div>
                <p className="work-desc">A 12-post Instagram grid strategy with a retro film strip aesthetic — a cohesive hero image revealing the Music Society's annual core team.</p>
                <div className="work-tool">Figma</div>
              </div>
            </div>

          </div>
        </div>
      </section>

      <div className="section-transition"></div>

      <section className="contact" id="contact">
        <div className="section-label fade-in" style={{justifyContent:"center",maxWidth:"200px",margin:"0 auto 1rem"}}>Get in touch</div>
        <h2 className="contact-big fade-in">Let's <em>Create</em><br/>Together</h2>
        <div className="contact-links fade-in">
          <a className="contact-link" href="mailto:anshikaa.1776@gmail.com">anshikaa.1776@gmail.com</a>
          <a className="contact-link" href="mailto:anshika023btcse24@igdtuw.ac.in">anshika023btcse24@igdtuw.ac.in</a>
          <a className="contact-link" href="https://www.linkedin.com/in/anshika-bb76b3320" target="_blank" rel="noreferrer">LinkedIn →</a>
        </div>
        <div className="footer-bar fade-in">
          <span>© 2025 Anshika</span>
          <span>Graphic Designer · Delhi, India</span>
          <span>Built with ♥</span>
        </div>
      </section>

      <div id="lightbox">
        <div className="lb-content">
          <span id="close-lightbox">✕ Close</span>
          <div className="lb-image-side"></div>
          <div className="lb-info-side">
            <div id="lb-tag"></div>
            <h2 id="lb-title"></h2>
            <p id="lb-desc"></p>
            <div id="lb-tools"></div>
          </div>
        </div>
      </div>
    </>
  );
}