import React, { PropTypes } from "react"
import { fromJS } from "immutable"
import { getSampleSchema } from "core/utils"

const getExampleComponent = ( sampleResponse, examples, HighlightCode ) => {
  if ( examples && examples.size ) {
    return examples.entrySeq().map( ([ key, example ]) => {
      let exampleValue
      try {
        exampleValue = example && example.toJS ? example.toJS() : example
        exampleValue = JSON.stringify(exampleValue, null, 2)
      }
      catch(e) {
        exampleValue = String(example)
      }
      return (<div key={ key }>
        <h5>{ key }</h5>
        <HighlightCode className="example" value={ exampleValue } />
      </div>)
    }).toArray()
  }

  if ( sampleResponse ) { return <div>
      <HighlightCode className="example" value={ sampleResponse } />
    </div>
  }
  return null
}

export default class Response extends React.Component {

  static propTypes = {
    code: PropTypes.string.isRequired,
    response: PropTypes.object,
    className: PropTypes.string,
    getComponent: PropTypes.func.isRequired,
    specSelectors: PropTypes.object.isRequired,
    specPath: PropTypes.array.isRequired,
    fn: PropTypes.object.isRequired,
    contentType: PropTypes.string
  }

  static defaultProps = {
    response: fromJS({}),
  };

  render() {
    let {
      code,
      response,
      className,
      specPath,
      fn,
      getComponent,
      specSelectors,
      contentType
    } = this.props

    let { inferSchema } = fn

    let schema = inferSchema(response.toJS()) // TODO: don't convert back and forth. Lets just stick with immutable for inferSchema
    const specPathWithPossibleSchema = response.has("schema") ? [...specPath, "schema"] : specPath
    let headers = response.get("headers")
    let examples = response.get("examples")
    const Headers = getComponent("headers")
    const HighlightCode = getComponent("highlightCode")
    const ModelExample = getComponent("modelExample")
    const Markdown = getComponent( "Markdown" )

    let sampleResponse = schema ? getSampleSchema(schema, contentType, { includeReadOnly: true }) : null
    let example = getExampleComponent( sampleResponse, examples, HighlightCode )

    return (
      <tr className={ "response " + ( className || "") }>
        <td className="col response-col_status">
          { code }
        </td>
        <td className="col response-col_description">

          <div className="response-col_description__inner">
            <Markdown source={ response.get( "description" ) } />
          </div>

          { example ? (
            <ModelExample
              specPath={specPathWithPossibleSchema}
              getComponent={ getComponent }
              specSelectors={ specSelectors }
              schema={ fromJS(schema) }
              example={ example }/>
          ) : null}

          { headers ? (
            <Headers headers={ headers }/>
          ) : null}

        </td>

      </tr>
    )
  }
}
