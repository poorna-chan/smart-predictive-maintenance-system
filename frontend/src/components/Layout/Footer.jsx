// Footer component
import React from 'react';

const Footer = () => (
  <footer style={styles.footer}>
    <p style={styles.text}>
      © {new Date().getFullYear()} Smart Predictive Maintenance System • Built with ⚡ React + Node.js + Socket.IO
    </p>
  </footer>
);

const styles = {
  footer: {
    borderTop: '1px solid var(--border-color)',
    padding: '1rem 1.5rem',
    textAlign: 'center'
  },
  text: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)'
  }
};

export default Footer;
