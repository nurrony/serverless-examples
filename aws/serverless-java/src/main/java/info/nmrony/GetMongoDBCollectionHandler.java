package info.nmrony;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.apache.log4j.Logger;
import org.apache.log4j.BasicConfigurator;

import com.mongodb.MongoClient;
import com.mongodb.MongoClientURI;
import com.mongodb.client.MongoDatabase;
import com.mongodb.client.MongoIterable;

import java.util.List;
import java.util.ArrayList;

import java.util.Collections;
import java.util.Date;
import java.util.Map;


public class GetMongoDBCollectionHandler implements RequestHandler<Map<String, Object>, ApiGatewayResponse> {

  private static final Logger LOG = Logger.getLogger(GetMongoDBCollectionHandler.class);

  @Override
  public ApiGatewayResponse handleRequest(Map<String, Object> input, Context context) {
    BasicConfigurator.configure();
    String Dsn = "mongodb://{user}:{pass}@{host}:{port}/{auth_db_name}?readPreference=primary";
    LOG.info("received: " + input);
    MongoIterable<String> mongoIterable = null;
    List<String> collections;

    try (MongoClient mongoClient = _getMongoDBClient(Dsn)) {
      Map<String, String> pathParameters = (Map<String, String>) input.get("pathParameters");
      String dbName = pathParameters.get("dbName");
      LOG.info("Getting paramName: " + dbName);
      MongoDatabase database = mongoClient.getDatabase(dbName);
      mongoIterable = database.listCollectionNames();
      collections = new ArrayList<>();
      for (String collectionName: mongoIterable) {
        collections.add(collectionName);
      }

    } catch (Exception e) {
      LOG.error(e, e);
      Response responseBody = new Response("Failure getting transactions", input);
      return ApiGatewayResponse.builder()
          .setStatusCode(500)
          .setObjectBody(responseBody)
          .setHeaders(Collections.singletonMap("X-Powered-By", "AWS Lambda & serverless"))
          .build();
    }
    return ApiGatewayResponse.builder()
        .setStatusCode(200)
        .setObjectBody(collections)
        .setHeaders(Collections.singletonMap("X-Powered-By", "AWS Lambda & serverless"))
        .build();
  }

  private MongoClient _getMongoDBClient(String Dsn) {
    MongoClientURI connectionString = new MongoClientURI(Dsn);
    return new MongoClient(connectionString);

  }

}
