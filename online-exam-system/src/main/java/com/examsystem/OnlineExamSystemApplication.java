package com.examsystem;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.web.bind.annotation.RestController;

@SpringBootApplication
@EnableJpaAuditing
@EnableScheduling
public class OnlineExamSystemApplication {
	public static void main(String[] args) {
		SpringApplication.run(OnlineExamSystemApplication.class, args);
		System.out.println("\n✅ ====================================");
		System.out.println("✅ Online Exam System Started!");
		System.out.println("✅ Server: http://localhost:8080");
		System.out.println("✅ API Base: http://localhost:8080/api");
		System.out.println("✅ Swagger UI: http://localhost:8080/swagger-ui.html");
		System.out.println("✅ API Docs: http://localhost:8080/api-docs");
		System.out.println("✅ ====================================\n");
	}
}