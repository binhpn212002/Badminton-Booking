<script setup lang="ts">
definePageMeta({ layout: 'booking' })

useSeoMeta({
  title: 'Điều khoản sử dụng | Badminton Booking',
  description:
    'Điều khoản sử dụng dịch vụ Badminton Booking — quyền và nghĩa vụ khi sử dụng nền tảng đặt sân.',
})
</script>

<template>
  <div class="legal-page">
    <article class="legal-doc">
      <p class="brand-mark">Badminton Booking</p>
      <h1>Điều khoản sử dụng</h1>
      <p class="updated">Cập nhật lần cuối: 3 tháng 8, 2026</p>

      <section>
        <h2>1. Chấp nhận điều khoản</h2>
        <p>
          Khi truy cập hoặc sử dụng Badminton Booking (“Dịch vụ”), bạn đồng ý
          với các Điều khoản này. Nếu không đồng ý, vui lòng không sử dụng Dịch
          vụ.
        </p>
      </section>

      <section>
        <h2>2. Mô tả dịch vụ</h2>
        <p>
          Badminton Booking cho phép người dùng tìm kiếm, đặt sân cầu lông, quản
          lý đơn hàng và các tiện ích liên quan (mua sắm phụ kiện, voucher, thông
          báo…). Một số tính năng có thể yêu cầu đăng nhập hoặc kết nối tài khoản
          bên thứ ba (Google, Zalo, TikTok…).
        </p>
      </section>

      <section>
        <h2>3. Tài khoản người dùng</h2>
        <ul>
          <li>Bạn chịu trách nhiệm bảo mật thông tin đăng nhập.</li>
          <li>Thông tin cung cấp phải chính xác và cập nhật.</li>
          <li>
            Chúng tôi có quyền tạm khóa hoặc chấm dứt tài khoản nếu phát hiện
            gian lận, lạm dụng hoặc vi phạm điều khoản.
          </li>
        </ul>
      </section>

      <section>
        <h2>4. Đặt sân và thanh toán</h2>
        <ul>
          <li>
            Booking chỉ được xác nhận khi hệ thống ghi nhận thành công theo quy
            trình của từng chi nhánh/phương thức thanh toán.
          </li>
          <li>
            Giá, khung giờ và chính sách hủy/đổi có thể khác nhau theo sân; thông
            tin hiển thị tại thời điểm đặt là căn cứ chính.
          </li>
          <li>
            Giao dịch thanh toán qua bên thứ ba (ví dụ VNPay) tuân theo điều khoản
            của nhà cung cấp đó.
          </li>
        </ul>
      </section>

      <section>
        <h2>5. Hành vi bị cấm</h2>
        <ul>
          <li>Sử dụng Dịch vụ cho mục đích bất hợp pháp.</li>
          <li>Can thiệp hệ thống, thu thập dữ liệu trái phép, spam.</li>
          <li>Mạo danh người khác hoặc cung cấp thông tin giả.</li>
          <li>Lạm dụng API hoặc tích hợp mạng xã hội ngoài phạm vi được phép.</li>
        </ul>
      </section>

      <section>
        <h2>6. Sở hữu trí tuệ</h2>
        <p>
          Giao diện, thương hiệu, nội dung và phần mềm của Badminton Booking thuộc
          quyền sở hữu của chúng tôi hoặc bên cấp phép. Bạn không được sao chép,
          sửa đổi hoặc phân phối khi chưa có sự đồng ý bằng văn bản.
        </p>
      </section>

      <section>
        <h2>7. Giới hạn trách nhiệm</h2>
        <p>
          Dịch vụ được cung cấp “nguyên trạng”. Trong phạm vi pháp luật cho phép,
          chúng tôi không chịu trách nhiệm cho thiệt hại gián tiếp, mất dữ liệu,
          gián đoạn dịch vụ do yếu tố ngoài kiểm soát hợp lý (mạng, bên thứ ba,
          sự cố hạ tầng…).
        </p>
      </section>

      <section>
        <h2>8. Thay đổi điều khoản</h2>
        <p>
          Chúng tôi có thể cập nhật Điều khoản theo thời gian. Phiên bản mới có
          hiệu lực khi đăng trên trang này. Việc tiếp tục sử dụng Dịch vụ sau khi
          cập nhật đồng nghĩa với việc bạn chấp nhận thay đổi.
        </p>
      </section>

      <section>
        <h2>9. Liên hệ</h2>
        <p>
          Mọi thắc mắc về Điều khoản sử dụng, vui lòng liên hệ:
          <a href="mailto:teamgf2002@gmail.com">teamgf2002@gmail.com</a>
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
