namespace Finhub.API.Security
{
    public static class EncryptionHelper
    {
        // Key phải đúng 32 ký tự cho AES-256
        private static readonly string Key = "jUZJkd0gRS6Ch8ul97YK7EpknplEzs4E";

        public static string EncryptDecimal(decimal value)
        {
            // Logic mã hóa của bạn ở đây
            return "ENCRYPTED_" + value.ToString(); // Demo đơn giản
        }

        public static decimal DecryptToDecimal(string value)
        {
            // Logic giải mã của bạn ở đây
            if (value.StartsWith("ENCRYPTED_"))
                return decimal.Parse(value.Replace("ENCRYPTED_", ""));
            return 0;
        }
    }
}