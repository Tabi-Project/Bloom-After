export function renderCrisisStrip() {
  return `
    <div class="container crisis-strip-wrapper">
      <aside class="emergency-banner" aria-label="Crisis support">
        <h3>Need Immediate Help?</h3>
        <div class="contact-links">
          
          <a href="tel:08062106493" class="contact-item" aria-label="Call Nigeria Suicide Prevention Helpline: 0806 210 6493">
            <span class="icon" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.18 2 2 0 0 1 3.59 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.53a16 16 0 0 0 6.29 6.29l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
            </span>
            <div>
              <p class="label">Nigeria Suicide Prevention Helpline</p>
              <p class="phone">0806 210 6493</p>
            </div>
          </a>

          <a href="tel:08091116264" class="contact-item" aria-label="Call Mentally Aware Nigeria Initiative: 0809 111 6264">
            <span class="icon" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.18 2 2 0 0 1 3.59 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.53a16 16 0 0 0 6.29 6.29l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
            </span>
            <div>
              <p class="label">Mentally Aware Nigeria Initiative</p>
              <p class="phone">0809 111 6264</p>
            </div>
          </a>

        </div>
      </aside>
    </div>
  `;
}