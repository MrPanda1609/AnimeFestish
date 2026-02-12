// === Footer Component ===

export function renderFooter() {
  const footer = document.getElementById('footer');
  footer.innerHTML = `
    <div class="footer">
      <div class="footer-inner">
        <div class="footer-logo">AnimeFetish</div>
        <p class="footer-desc">
          Website xem anime vietsub miễn phí chất lượng cao. 
          Kho anime phong phú, cập nhật nhanh nhất. 
          Không lưu trữ phim trên server.
        </p>
        <div class="footer-links">
          <a href="#/">Trang chủ</a>
          <a href="#/anime">Anime</a>
          <a href="#/search/">Tìm kiếm</a>
        </div>
        <p class="footer-copy">© ${new Date().getFullYear()} AnimeFetish. Dữ liệu tổng hợp từ nhiều nguồn.</p>
      </div>
    </div>
  `;
}
