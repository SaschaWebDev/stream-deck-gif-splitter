export function UserManual() {
  return (
    <section className='hw-screen-panel hw-faq-panel'>
      <div className='hw-panel-header'>
        <div className='hw-led hw-led-blue' />
        <h2 className='hw-panel-title'>USER MANUAL</h2>
      </div>

      <div className='hw-faq-list'>
        <details className='hw-faq-item'>
          <summary>What is this tool?</summary>
          <p>
            This is a browser-based tool that splits animated GIF files
            into a grid of smaller animated tiles, designed to be used as
            animated backgrounds on Elgato Stream Deck devices. All
            processing happens locally in your browser — no files are
            uploaded to any server.
          </p>
        </details>
        <details className='hw-faq-item'>
          <summary>Which Stream Deck models are supported?</summary>
          <p>
            We currently support the Stream Deck MK.2 (5×3), Stream Deck
            XL (8×4), Stream Deck Mini (3×2), Stream Deck + (4×2), and
            Stream Deck Neo (4×2). Each preset automatically adjusts the
            crop dimensions and tile sizes to match the device.
          </p>
        </details>
        <details className='hw-faq-item'>
          <summary>How do I set up the tiles on my Stream Deck?</summary>
          <p>
            <strong>Option 1 — ZIP download:</strong> Extract the folder
            and assign each numbered tile to the corresponding button
            position in the Elgato Stream Deck software. Tiles are
            numbered left-to-right, top-to-bottom to match the button
            layout. You can also drag and drop the GIF tiles onto the
            Stream Deck buttons to insert them quicker.
          </p>
          <p>
            <strong>Option 2 — .streamDeckProfile:</strong> Download the
            .streamDeckProfile file and open it. The Stream Deck software
            will automatically detect it and prompt you to install it.
            This creates a separate profile alongside your existing ones,
            so you can use it as a starting point or just preview how the
            animated background looks on your device.
          </p>
          <p>
            Check out{' '}
            <a
              href='https://youtu.be/uMJPHHkHC9k?si=nRqH2r-mB7Tkm97m&t=300'
              target='_blank'
              rel='noopener noreferrer'
            >
              this video
            </a>{' '}
            for a quick tutorial.
          </p>
        </details>
        <details className='hw-faq-item'>
          <summary>Why is the animation out of sync or laggy?</summary>
          <p>
            <strong>Out of sync:</strong> Animated buttons falling out of
            sync is a common issue. To fix it, click the "Profile"
            dropdown in the Stream Deck software, switch to the Default
            Profile, then switch back. This forces all animations to
            restart at the same time.
          </p>
          <p>
            <strong>Laggy or poor quality:</strong> The output quality
            depends heavily on your input GIF. Files with long animation
            cycles or large file sizes may not display well on the
            hardware. Try using a shorter or smaller GIF if the result
            looks off.
          </p>
        </details>
        <details className='hw-faq-item'>
          <summary>Can I use the LCD touchscreen area for GIFs?</summary>
          <p>
            Unfortunately, the LCD touchscreen strip (found on devices
            like the Stream Deck +) does not support animated GIFs. Only
            the physical button positions can display animated
            backgrounds.
          </p>
        </details>
        <details className='hw-faq-item'>
          <summary>How does the processing work?</summary>
          <p>
            All processing is done entirely in your browser using
            ffmpeg.wasm — your files never leave your device. The ffmpeg
            library (~31 MB) is loaded once from a CDN and cached by your
            browser, so the first use may take a moment but subsequent
            visits will be much faster. We use a high-quality two-pass
            encoding process with optimal palette generation and
            Floyd-Steinberg dithering to preserve as much quality as
            possible. The crop preview lets you review the result before
            splitting. Enable <strong>Custom Crop</strong> to drag the
            crop region and choose which area to keep instead of
            center-cropping. Enable <strong>Custom Loop</strong> to trim
            the animation length — drag the timeline handles to select
            which portion of the GIF to keep.
          </p>
        </details>
      </div>
    </section>
  );
}
