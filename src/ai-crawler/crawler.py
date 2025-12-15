import requests
import time
import os
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class ScamCrawler:
    def __init__(self, api_base_url=None):
        self.api_base_url = api_base_url or os.getenv('API_BASE_URL', 'http://localhost:3000')
        print(f"✅ Crawler initialized with API: {self.api_base_url}")
        
    def start_crawl(self, source_id):
        """Bắt đầu crawl và tạo log"""
        print(f"📡 Starting crawl for source {source_id}...")
        
        try:
            response = requests.post(
                f"{self.api_base_url}/api/ai/crawl-start",
                json={"source_id": source_id},
                timeout=10
            )
            response.raise_for_status()
            data = response.json()
            
            if data.get("success"):
                print(f"✅ Crawl log created: {data['data']['crawl_log_id']}")
                return data["data"]["crawl_log_id"]
            else:
                raise Exception(f"API returned error: {data.get('error')}")
                
        except requests.exceptions.RequestException as e:
            print(f"❌ Network error: {str(e)}")
            raise
        except Exception as e:
            print(f"❌ Error: {str(e)}")
            raise
    
    def save_phone_number(self, phone_number, source_id, confidence_score, scam_type=None, raw_data=None):
        """Lưu số điện thoại đã crawl được"""
        try:
            response = requests.post(
                f"{self.api_base_url}/api/ai/save-numbers",
                json={
                    "phone_number": phone_number,
                    "source_id": source_id,
                    "confidence_score": confidence_score,
                    "scam_type": scam_type,
                    "raw_data": raw_data
                },
                timeout=10
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"❌ Error saving phone {phone_number}: {str(e)}")
            return {"success": False, "error": str(e)}
    
    def complete_crawl(self, crawl_log_id, status, numbers_found, numbers_added, 
                       numbers_updated, crawl_duration, error_message=None):
        """Hoàn thành crawl và cập nhật log"""
        try:
            response = requests.post(
                f"{self.api_base_url}/api/ai/crawl-complete",
                json={
                    "crawl_log_id": crawl_log_id,
                    "status": status,
                    "numbers_found": numbers_found,
                    "numbers_added": numbers_added,
                    "numbers_updated": numbers_updated,
                    "crawl_duration": crawl_duration,
                    "error_message": error_message
                },
                timeout=10
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"❌ Error completing crawl: {str(e)}")
            return {"success": False, "error": str(e)}
    
    def crawl_source(self, source_id, source_url):
        """Main crawl function"""
        print(f"\n{'='*60}")
        print(f"🚀 Starting crawl for source {source_id}: {source_url}")
        print(f"{'='*60}")
        
        start_time = time.time()
        crawl_log_id = None
        numbers_found = 0
        numbers_added = 0
        numbers_updated = 0
        
        try:
            # 1. Bắt đầu crawl
            crawl_log_id = self.start_crawl(source_id)
            
            # 2. Crawl website
            print(f"🔍 Extracting phone numbers from {source_url}...")
            phone_numbers = self.extract_phone_numbers(source_url)
            numbers_found = len(phone_numbers)
            print(f"📊 Found {numbers_found} phone numbers")
            
            # 3. Lưu từng số điện thoại
            for i, phone_data in enumerate(phone_numbers, 1):
                print(f"💾 Saving phone {i}/{numbers_found}: {phone_data['phone']}")
                
                result = self.save_phone_number(
                    phone_number=phone_data["phone"],
                    source_id=source_id,
                    confidence_score=phone_data["confidence"],
                    scam_type=phone_data.get("scam_type"),
                    raw_data=phone_data.get("raw_data")
                )
                
                if result.get("success"):
                    if result["data"]["is_new"]:
                        numbers_added += 1
                        print(f"  ✅ New number added")
                    else:
                        numbers_updated += 1
                        print(f"  ♻️  Existing number updated")
                else:
                    print(f"  ❌ Failed to save")
            
            # 4. Hoàn thành crawl
            crawl_duration = int(time.time() - start_time)
            self.complete_crawl(
                crawl_log_id=crawl_log_id,
                status="success",
                numbers_found=numbers_found,
                numbers_added=numbers_added,
                numbers_updated=numbers_updated,
                crawl_duration=crawl_duration
            )
            
            print(f"\n{'='*60}")
            print(f"🎉 Crawl completed successfully!")
            print(f"📊 Stats:")
            print(f"   - Found: {numbers_found}")
            print(f"   - Added: {numbers_added}")
            print(f"   - Updated: {numbers_updated}")
            print(f"   - Duration: {crawl_duration}s")
            print(f"{'='*60}\n")
            
        except Exception as e:
            print(f"\n{'='*60}")
            print(f"❌ Error during crawl: {str(e)}")
            print(f"{'='*60}\n")
            
            if crawl_log_id:
                crawl_duration = int(time.time() - start_time)
                self.complete_crawl(
                    crawl_log_id=crawl_log_id,
                    status="failed",
                    numbers_found=numbers_found,
                    numbers_added=numbers_added,
                    numbers_updated=numbers_updated,
                    crawl_duration=crawl_duration,
                    error_message=str(e)
                )
    
    def extract_phone_numbers(self, url):
        """
        Crawl website và extract số điện thoại
        TODO: Implement actual web scraping logic
        """
        # Placeholder - trả về dữ liệu mẫu
        print("⚠️  Using mock data (implement actual crawling)")
        
        import random
        
        mock_phones = [
            f"09{random.randint(10000000, 99999999)}",
            f"03{random.randint(10000000, 99999999)}",
            f"07{random.randint(10000000, 99999999)}",
        ]
        
        return [
            {
                "phone": phone,
                "confidence": round(random.uniform(70, 99), 1),
                "scam_type": random.choice(["loan_scam", "investment_fraud", "impersonation"]),
                "raw_data": {"source_text": f"Mock data for {phone}"}
            }
            for phone in mock_phones
        ]

# Usage example
if __name__ == "__main__":
    print("🤖 ScamCrawler Test")
    print(f"⏰ Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
    
    crawler = ScamCrawler()
    
    # Test crawl với source_id = 1
    crawler.crawl_source(
        source_id=1,
        source_url="https://example-forum.com/scam-reports"
    )
    
    print(f"\n⏰ Finished at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")