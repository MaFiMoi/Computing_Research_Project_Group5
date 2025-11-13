import schedule
import time
import requests
from crawler import ScamCrawler

class CrawlScheduler:
    def __init__(self, api_base_url="http://localhost:3000"):
        self.api_base_url = api_base_url
        self.crawler = ScamCrawler(api_base_url)
    
    def get_active_sources(self):
        """Lấy danh sách web sources đang hoạt động"""
        response = requests.get(f"{self.api_base_url}/api/admin/web-sources")
        data = response.json()
        
        if data["success"]:
            # Chỉ lấy sources đang active
            return [s for s in data["data"] if s["is_active"]]
        return []
    
    def crawl_all_sources(self):
        """Crawl tất cả sources"""
        sources = self.get_active_sources()
        print(f"Found {len(sources)} active sources")
        
        for source in sources:
            try:
                self.crawler.crawl_source(
                    source_id=source["id"],
                    source_url=source["source_url"]
                )
                time.sleep(5)  # Delay giữa các requests
            except Exception as e:
                print(f"Error crawling source {source['id']}: {str(e)}")
    
    def crawl_by_frequency(self, frequency):
        """Crawl sources theo tần suất"""
        sources = self.get_active_sources()
        sources_to_crawl = [s for s in sources if s["crawl_frequency"] == frequency]
        
        print(f"Crawling {len(sources_to_crawl)} sources with frequency: {frequency}")
        
        for source in sources_to_crawl:
            try:
                self.crawler.crawl_source(
                    source_id=source["id"],
                    source_url=source["source_url"]
                )
                time.sleep(5)
            except Exception as e:
                print(f"Error: {str(e)}")
    
    def start(self):
        """Khởi động scheduler"""
        print("Starting crawler scheduler...")
        
        # Schedule hourly crawls
        schedule.every().hour.do(lambda: self.crawl_by_frequency("hourly"))
        
        # Schedule daily crawls (at 2 AM)
        schedule.every().day.at("02:00").do(lambda: self.crawl_by_frequency("daily"))
        
        # Schedule weekly crawls (Monday at 3 AM)
        schedule.every().monday.at("03:00").do(lambda: self.crawl_by_frequency("weekly"))
        
        print("Scheduler started. Running...")
        
        while True:
            schedule.run_pending()
            time.sleep(60)  # Check every minute

if __name__ == "__main__":
    scheduler = CrawlScheduler()
    scheduler.start()