<script setup lang="ts">
definePageMeta({ layout: 'booking' })

useSeoMeta({
  title: 'Chính sách bảo mật | Badminton Booking',
  description:
    'Chính sách bảo mật của Badminton Booking — cách chúng tôi thu thập, sử dụng và bảo vệ dữ liệu người dùng.',
})
</script>

<template>
  <div class="legal-page">
    <article class="legal-doc">
      <p class="brand-mark">Badminton Booking</p>
      <h1>Chính sách bảo mật</h1>
      <p class="updated">Cập nhật lần cuối: 3 tháng 8, 2026</p>

      <section>
        <h2>1. Giới thiệu</h2>
        <p>
          Badminton Booking (“chúng tôi”) cung cấp nền tảng đặt sân cầu lông,
          quản lý booking và dịch vụ liên quan. Chính sách này giải thích dữ liệu
          nào được thu thập, mục đích sử dụng và quyền của bạn.
        </p>
      </section>

      <section>
        <h2>2. Dữ liệu chúng tôi thu thập</h2>
        <ul>
          <li>
            <strong>Thông tin tài khoản:</strong> họ tên, email, số điện thoại,
            ảnh đại diện (khi bạn cung cấp hoặc đăng nhập qua bên thứ ba).
          </li>
          <li>
            <strong>Thông tin đặt sân:</strong> chi nhánh, sân, khung giờ, đơn
            hàng, thanh toán và lịch sử giao dịch.
          </li>
          <li>
            <strong>Dữ liệu kỹ thuật:</strong> địa chỉ IP, loại trình duyệt,
            thiết bị, nhật ký truy cập phục vụ bảo mật và cải thiện dịch vụ.
          </li>
          <li>
            <strong>Đăng nhập mạng xã hội:</strong> nếu bạn kết nối Google, Zalo,
            TikTok hoặc nhà cung cấp khác, chúng tôi nhận các thông tin cơ bản
            mà bạn cho phép (ví dụ định danh, tên hiển thị, email) theo phạm vi
            ủy quyền.
          </li>
        </ul>
      </section>

      <section>
        <h2>3. Mục đích sử dụng</h2>
        <ul>
          <li>Tạo và quản lý tài khoản, xác thực đăng nhập.</li>
          <li>Xử lý đặt sân, thanh toán, thông báo và hỗ trợ khách hàng.</li>
          <li>Cải thiện trải nghiệm, phát hiện gian lận và bảo vệ hệ thống.</li>
          <li>Tuân thủ nghĩa vụ pháp lý khi được yêu cầu hợp lệ.</li>
        </ul>
      </section>

      <section>
        <h2>4. Chia sẻ dữ liệu</h2>
        <p>
          Chúng tôi không bán dữ liệu cá nhân. Dữ liệu có thể được chia sẻ với:
        </p>
        <ul>
          <li>Nhà cung cấp thanh toán, email, hosting khi cần vận hành dịch vụ.</li>
          <li>
            Nền tảng đăng nhập bên thứ ba (Google, Zalo, TikTok…) theo quyền bạn
            đã cấp.
          </li>
          <li>Cơ quan nhà nước khi có yêu cầu theo pháp luật.</li>
        </ul>
      </section>

      <section>
        <h2>5. Lưu trữ và bảo mật</h2>
        <p>
          Dữ liệu được lưu trên hạ tầng phù hợp và áp dụng biện pháp kỹ thuật
          hợp lý để hạn chế truy cập trái phép. Không có hệ thống nào bảo mật
          tuyệt đối; bạn nên bảo vệ thông tin đăng nhập của mình.
        </p>
      </section>

      <section>
        <h2>6. Quyền của bạn</h2>
        <p>Bạn có thể yêu cầu:</p>
        <ul>
          <li>Truy cập, chỉnh sửa hoặc cập nhật thông tin cá nhân.</li>
          <li>Xóa tài khoản và dữ liệu liên quan (trừ dữ liệu bắt buộc lưu theo luật).</li>
          <li>Thu hồi quyền kết nối mạng xã hội trong phần cài đặt tài khoản hoặc trên nền tảng đó.</li>
        </ul>
      </section>

      <section>
        <h2>7. Cookie và công nghệ tương tự</h2>
        <p>
          Chúng tôi có thể dùng cookie/phiên đăng nhập để duy trì phiên làm việc
          và ghi nhớ tùy chọn. Bạn có thể tắt cookie trong trình duyệt; một số
          tính năng có thể không hoạt động đầy đủ.
        </p>
      </section>

      <section>
        <h2>8. Liên hệ</h2>
        <p>
          Mọi câu hỏi về bảo mật dữ liệu, vui lòng liên hệ:
          <a href="mailto:privacy@badmintonbooking.local">privacy@badmintonbooking.local</a>
        </p>
      </section>
    </article>
  </div>
</template>

<style scoped>
.legal-page {
  max-width: 760px;
  margin: 0 auto;
  padding: 40px 20px 72px;
}

.legal-doc {
  background: #fff;
  border: 1px solid #e8ece9;
  border-radius: 12px;
  padding: 36px 32px 40px;
}

.brand-mark {
  margin: 0 0 8px;
  color: #26c73e;
  font-weight: 600;
  font-size: 0.95rem;
  letter-spacing: 0.02em;
}

h1 {
  margin: 0 0 8px;
  font-size: 1.75rem;
  color: #1f2937;
}

.updated {
  margin: 0 0 28px;
  color: #6b7280;
  font-size: 0.9rem;
}

section + section {
  margin-top: 24px;
}

h2 {
  margin: 0 0 10px;
  font-size: 1.1rem;
  color: #111827;
}

p,
li {
  color: #374151;
  line-height: 1.65;
  font-size: 0.95rem;
}

ul {
  margin: 0;
  padding-left: 1.25rem;
}

li + li {
  margin-top: 6px;
}

a {
  color: #26c73e;
}
</style>
