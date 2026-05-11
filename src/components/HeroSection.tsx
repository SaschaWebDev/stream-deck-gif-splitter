export function HeroSection() {
  return (
    <section className='hw-screen-panel hw-hero-panel'>
      <img
        className='hw-hero-logo'
        src='/stream-deck-gif-splitter-logo-big.png'
        alt='Stream Deck GIF Splitter'
      />
      <h1 className='hw-title'>
        Split images & GIFs for
        <br /> your <span className='hw-title-accent'>Stream Deck</span>
      </h1>
      <p className='hw-subtitle'>
        Drop a GIF or an image below to split it into a grid of tiles,
        perfectly sized for your Stream Deck background. Cutoff mode is
        automatically disabled for the screensaver maker.
      </p>
    </section>
  );
}
