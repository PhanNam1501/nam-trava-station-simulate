# TRAVA LENDING POOL

# Table of Contents

- [Tên Dự Án](#tên-dự-án)
  - [Mô Tả](#mô-tả)
  - [Các Tính Năng Chính](#các-tính-năng-chính)
  - [Công Nghệ Sử Dụng](#công-nghệ-sử-dụng)
  - [Hướng Dẫn Cài Đặt](#hướng-dẫn-cài-đặt)
  - [Hướng Dẫn Sử Dụng](#hướng-dẫn-sử-dụng) 
    - [Trava Pools actions](#simulate-trava-pools-actions)
        - [Deposit](#deposit)
        - [Borrow](#borrow)
        - [Repay](#repay)
        - [Withdraw](#withdraw)
        - [ClaimRewards](#claimrewards)
        - [Convert rewards](#convert-rewards)
  -[Các hàm tính toán](#các-hàm-tính-toán)
    -[Cách tính max supply](#cách-tính-max-supply) 
    -[Cách tính borrow](#cách-tính-borrow) 
    -[Cách tính withdraw](#cách-tính-withdraw) 
    -[Cách tính max repay](#cách-tính-max-repay) 
    -[Cách tính reward](#cách-tính-reward) 
    -[Cách tính borrow limit](#cách-tính-borrow-limit) 
    -[Cách tính borrow rate](#cách-tính-borrow-rate)

## Mô Tả

Dự án ứng dụng "Trava Lending Pool" là một hệ thống sử dụng công nghệ blockchain để cung cấp các dịch vụ về vay và cho vay tiền một cách phi tập trung. Dự án này đang phát triển nhằm giúp người dùng:

1. Vay Tiền Phi Tập Trung

- Hệ thống cho phép người dùng vay tiền mà không cần thông qua các tổ chức tài chính trung gian. Người dùng có thể cược tài sản số của họ (ví dụ: cryptocurrencies) để đảm bảo khoản vay và nhận được tiền mặt hoặc tài sản số trong một khoản thời gian cố định.

2. Cho Vay Tiền Phi Tập Trung

- Ngoài việc vay tiền, hệ thống cũng cho phép người dùng gửi tiền của họ vào một hồ bơi tài sản số. Những người khác có thể mượn tiền từ hồ bơi này bằng cách cược tài sản số của họ.

3. Hợp đồng thông minh

- Các giao dịch trong hệ thống được thực hiện thông qua hợp đồng thông minh (smart contracts) trên blockchain. Điều này đảm bảo tính minh bạch và an toàn cho cả người cho vay và người vay.

4. Quản lý tài sản số

- Người dùng có thể theo dõi và quản lý tài sản số của họ trong ứng dụng, bao gồm cả số tiền vay và số tiền đang cho vay.

5. Tích Hợp Các Loại Tài Sản Số Khác Nhau

- Hệ thống hỗ trợ nhiều loại tài sản số khác nhau, cho phép người dùng đặt cược và vay với các loại tài sản như Bitcoin, Ethereum, stablecoins, và nhiều loại tiền điện tử khác.

6. Bảo Mật Và An Toàn

- Bảo mật là mối quan tâm hàng đầu. Hệ thống sử dụng các biện pháp bảo mật mạnh mẽ để đảm bảo rằng tài sản của người dùng được bảo vệ khỏi rủi ro.

7. Tích Hợp Wallet

- Để sử dụng ứng dụng, người dùng có thể tích hợp ví tiền điện tử của họ để quản lý tài sản và thực hiện các giao dịch.
  Dự án "Trava Lending Pool" sử dụng blockchain để loại bỏ sự phụ thuộc vào các tổ chức trung gian và cung cấp cơ hội cho người dùng tham gia vào thị trường vay và cho vay tiền một cách phi tập trung, minh bạch và an toàn.

## Các Tính Năng Chính

- [Liệt kê các tính năng chính của ứng dụng ở đây]

## Công Nghệ Sử Dụng

- Ngôn ngữ lập trình chính: [Ngôn ngữ chính TypeScript/JavaScript]
- Công nghệ blockchain: [Công nghệ blockchain chính Ethereum]

## Hướng Dẫn Cài Đặt

Để cài đặt và chạy dự án này trên máy tính của bạn, làm theo các bước sau:

1. **Clone dự án từ kho lưu trữ GitHub:**

   ```shell
   git clone https://github.com/TravaLendingPool/governance-interface.git
   ```

2. **Di chuyển vào thư mục dự án:**

   ```shell
   cd du-an-blockchain
   ```

3. **Cài đặt các gói phụ thuộc:**

   ```shell
   npm install
   ```

   hoặc

   ```shell
   yarn install
   ```

4. **Chạy dự án:**

   ```shell
   npm start
   ```

   hoặc

   ```shell
   yarn start
   ```

## Hướng Dẫn Sử Dụng
### Simulate Trava Pools actions
#### Deposit
#### Borrow
#### Repay
#### Withdraw
#### ClaimRewards
#### Convert rewards

## Các hàm tính toán
### Cách tính max supply

    